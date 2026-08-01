import { Prisma } from '@prisma/client';
import { OrderRepository, CouponRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { InventoryRepository } from '../repositories/inventoryRepository';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { generateOrderNumber, calculateTax, calculateShipping } from '../utils/helpers';
import { logger } from '../config/logger';
import { getPrisma } from '../config/database';
import { config } from '../config';
import { addJob } from '../workers/queue';
import { invalidateCache } from '../middleware/cache';
import { getStripe } from './paymentService';

type TransactionClient = Prisma.TransactionClient;

const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING:     ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:   ['PROCESSING', 'CANCELLED'],
  PROCESSING:  ['SHIPPED', 'CANCELLED'],
  SHIPPED:     ['DELIVERED'],
  DELIVERED:   ['REFUNDED'],
  CANCELLED:   [],
  REFUNDED:    [],
};

export class OrderService {
  private orderRepo: OrderRepository;
  private couponRepo: CouponRepository;
  private userRepo: UserRepository;
  private inventoryRepo: InventoryRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.couponRepo = new CouponRepository();
    this.userRepo = new UserRepository();
    this.inventoryRepo = new InventoryRepository();
  }

  async checkout(userId: string, data: {
    shippingAddressId: string;
    billingAddressId?: string;
    couponCode?: string;
    notes?: string;
    idempotencyKey?: string;
  }) {
    const prisma = getPrisma();

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  basePrice: true,
                  isActive: true,
                  deletedAt: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' as const },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      // Validate that the shipping address belongs to the current user
      const shippingAddress = await tx.address.findUnique({
        where: { id: data.shippingAddressId },
        select: { userId: true, deletedAt: true },
      });
      if (!shippingAddress) {
        throw new BadRequestError('Shipping address not found');
      }
      if (shippingAddress.deletedAt || shippingAddress.userId !== userId) {
        throw new BadRequestError('Invalid shipping address');
      }

      for (const item of cart.items) {
        if (!item.product.isActive || item.product.deletedAt) {
          throw new BadRequestError(
            `Product "${item.product.name}" is no longer available`,
          );
        }
      }

      const productIds = cart.items.map((item) => item.productId);
      const lockedInventory = await this.inventoryRepo.lockForCheckout(tx, productIds);

      const inventoryMap = new Map(
        lockedInventory.map((row) => [row.productId, row]),
      );

      for (const item of cart.items) {
        const inventory = inventoryMap.get(item.productId);
        if (!inventory) {
          throw new BadRequestError(
            `No inventory record for "${item.product.name}"`,
          );
        }

        const availableStock = inventory.stock - inventory.reservedStock;
        if (availableStock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for "${item.product.name}". ` +
            `Available: ${availableStock}, requested: ${item.quantity}`,
          );
        }
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.product.basePrice * item.quantity,
        0,
      );

      let discount = 0;
      let couponId: string | null = null;
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode },
          select: {
            id: true, code: true, discountType: true, discountValue: true,
            minOrderAmount: true, maxDiscount: true, usageLimit: true, usedCount: true,
            isActive: true, deletedAt: true, expiresAt: true,
          },
        });

        if (coupon) {
          if (!coupon.isActive || coupon.deletedAt) {
            throw new BadRequestError('Coupon is not active');
          }
          if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            throw new BadRequestError('Coupon has expired');
          }
          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new BadRequestError('Coupon usage limit reached');
          }
          if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            throw new BadRequestError(
              `Minimum order amount of $${(coupon.minOrderAmount / 100).toFixed(2)} required`,
            );
          }
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round(subtotal * (coupon.discountValue / 100));
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          } else {
            discount = coupon.discountValue;
          }
          couponId = coupon.id;
        }
      }

      const taxAmount = calculateTax(subtotal - discount);
      const shippingCharge = calculateShipping(subtotal);
      const grandTotal = subtotal - discount + taxAmount + shippingCharge;

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          status: 'PENDING',
          subtotal,
          taxAmount,
          shippingCharge,
          discountAmount: discount,
          couponId,
          grandTotal,
          notes: data.notes,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId || data.shippingAddressId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.basePrice,
              quantity: item.quantity,
              total: item.product.basePrice * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
          coupon: true,
          payments: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const batchItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await this.inventoryRepo.batchDecrement(tx, batchItems);

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      logger.info(
        { orderId: order.id, userId, itemCount: cart.items.length },
        'Order placed successfully',
      );

      return order;
    });

    invalidateCache('/api/v1/products*').catch((err) =>
      logger.error({ err }, 'Cache invalidation failed after checkout'),
    );

    addJob('order-confirmation', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      email: order.user?.email ?? '',
      firstName: order.user?.firstName ?? '',
      total: order.grandTotal,
    }).catch((err) =>
      logger.error({ err }, 'Failed to enqueue order confirmation job'),
    );

    return order;
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.deletedAt) throw new NotFoundError('Order');
    if (order.userId !== userId) throw new NotFoundError('Order');
    return order;
  }

  async getOrderForAdmin(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.deletedAt) throw new NotFoundError('Order');
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    if (!order || order.deletedAt) throw new NotFoundError('Order');
    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderRepo.findByUser(userId, skip, limit),
      this.orderRepo.countByUser(userId),
    ]);
    return { orders, total, page, limit };
  }

  async cancelOrder(userId: string, orderId: string, reason?: string) {
    const prisma = getPrisma();

    let wasPaid = false;
    let completedPaymentId: string | null = null;
    let completedPaymentStripeId: string | null = null;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true, payments: true },
      });

      if (!order) throw new NotFoundError('Order');
      if (order.userId !== userId) throw new NotFoundError('Order');

      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new BadRequestError('Order cannot be cancelled');
      }

      if (order.status === 'CONFIRMED') {
        wasPaid = true;
        const completedPayment = order.payments.find((p) => p.status === 'COMPLETED');
        if (completedPayment) {
          completedPaymentId = completedPayment.id;
          completedPaymentStripeId = completedPayment.stripePaymentId;
        }
      }

      const productIds = order.items.map((item) => item.productId);
      await this.inventoryRepo.lockForCheckout(tx, productIds);

      const batchItems = order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await this.inventoryRepo.batchReleaseReservation(tx, batchItems);

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason,
        },
        include: {
          items: true,
          payments: true,
          shippingAddress: true,
        },
      });
    });

    if (wasPaid && completedPaymentStripeId) {
      try {
        const stripe = getStripe();
        if (!stripe) throw new BadRequestError('Stripe not configured');
        await stripe.refunds.create({
          payment_intent: completedPaymentStripeId,
        });
        if (completedPaymentId) {
          const prisma = getPrisma();
          await prisma.payment.update({
            where: { id: completedPaymentId },
            data: { status: 'REFUNDED' },
          });
        }
        logger.info({ orderId, paymentId: completedPaymentId }, 'Refund processed for cancelled order');
      } catch (err) {
        logger.error({ orderId, err }, 'Refund failed for cancelled order — manual review required');
        throw new BadRequestError('Order cancelled but refund could not be processed. Please contact support.');
      }
    }

    // Use a broader cache pattern to clear all product-related caches
    invalidateCache('/api/v1/products*').catch((err) =>
      logger.error({ err }, 'Cache invalidation failed after order cancellation'),
    );

    return result;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
  ) {
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PROCESSING',
      'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid order status: ${newStatus}`);
    }

    const prisma = getPrisma();

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundError('Order');

      const allowedTransitions = VALID_ORDER_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(newStatus)) {
        throw new BadRequestError(
          `Cannot transition order from "${order.status}" to "${newStatus}". ` +
          `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
        );
      }

      const fulfillmentStatuses = ['SHIPPED', 'DELIVERED'];
      if (
        fulfillmentStatuses.includes(newStatus) &&
        !fulfillmentStatuses.includes(order.status)
      ) {
        const productIds = order.items.map((item) => item.productId);
        await this.inventoryRepo.lockForCheckout(tx, productIds);

        const batchItems = order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
        await this.inventoryRepo.batchFulfillReservation(tx, batchItems);
      }

      const updateData: Prisma.OrderUpdateInput = {
        status: newStatus,
      };
      if (newStatus === 'DELIVERED') updateData.deliveredAt = new Date();
      if (newStatus === 'CANCELLED') updateData.cancelledAt = new Date();

      return tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: true,
          payments: true,
          shippingAddress: true,
        },
      });
    });

    const fulfillmentStatuses = ['SHIPPED', 'DELIVERED'];
    if (fulfillmentStatuses.includes(newStatus)) {
      invalidateCache('/api/v1/products*').catch((err) =>
        logger.error({ err }, 'Cache invalidation failed after order status update'),
      );
    }

    return result;
  }

  async getAllOrders(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderRepo.findAll(skip, limit, status),
      this.orderRepo.countAll(status),
    ]);
    return { orders, total, page, limit };
  }
}

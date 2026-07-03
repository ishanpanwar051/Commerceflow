import { OrderRepository, CartRepository, CouponRepository } from '../repositories';
import { ProductRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { generateOrderNumber, calculateTax, calculateShipping } from '../utils/helpers';
import { logger } from '../config/logger';
import { getPrisma } from '../config/database';
import { addJob } from '../workers/queue';
import { invalidateCache } from '../middleware/cache';

export class OrderService {
  private orderRepo: OrderRepository;
  private cartRepo: CartRepository;
  private productRepo: ProductRepository;
  private couponRepo: CouponRepository;
  private userRepo: UserRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.cartRepo = new CartRepository();
    this.productRepo = new ProductRepository();
    this.couponRepo = new CouponRepository();
    this.userRepo = new UserRepository();
  }

  async checkout(userId: string, data: {
    shippingAddressId: string;
    billingAddressId?: string;
    couponCode?: string;
    notes?: string;
    idempotencyKey?: string;
  }) {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      const cart = await this.cartRepo.findByUser(userId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      const shippingAddress = await this.userRepo.findAddressById(data.shippingAddressId, userId);
      if (!shippingAddress) throw new NotFoundError('Shipping address');

      let billingAddress = shippingAddress;
      if (data.billingAddressId) {
        const ba = await this.userRepo.findAddressById(data.billingAddressId, userId);
        if (!ba) throw new NotFoundError('Billing address');
        billingAddress = ba;
      }

      for (const item of cart.items) {
        const inventory = item.product.inventory;
        if (inventory && inventory.stock - inventory.reservedStock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for ${item.product.name}`);
        }
      }

      const subtotal = cart.items.reduce((sum: number, item: any) =>
        sum + Number(item.product.basePrice) * item.quantity, 0);

      let discount = 0;
      let couponId: string | null = null;
      if (data.couponCode) {
        const coupon = await this.couponRepo.findByCode(data.couponCode);
        if (coupon) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = subtotal * (Number(coupon.discountValue) / 100);
            if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
          } else {
            discount = Number(coupon.discountValue);
          }
          couponId = coupon.id;
        }
      }

      const taxAmount = calculateTax(subtotal - discount);
      const shippingCharge = calculateShipping(subtotal);
      const grandTotal = Math.round((subtotal - discount + taxAmount + shippingCharge) * 100) / 100;

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
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          items: {
            create: cart.items.map((item: any) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.basePrice,
              quantity: item.quantity,
              total: Number(item.product.basePrice) * item.quantity,
            })),
          },
        },
        include: { items: true, shippingAddress: true, billingAddress: true, coupon: true, payments: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      });

      for (const item of cart.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { increment: item.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await invalidateCache('products:*');

      const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
      await addJob('order-confirmation', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        email: user?.email || '',
        total: order.grandTotal,
      });

      logger.info({ orderId: order.id, userId }, 'Order placed successfully');

      return order;
    });
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order || order.deletedAt) throw new NotFoundError('Order');
    if (order.userId !== userId) throw new NotFoundError('Order');
    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order');
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
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new NotFoundError('Order');
      if (order.userId !== userId) throw new NotFoundError('Order');
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new BadRequestError('Order cannot be cancelled');
      }

      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stock: { increment: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
        include: { items: true, payments: true, shippingAddress: true },
      });
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    return this.orderRepo.updateStatus(orderId, status);
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

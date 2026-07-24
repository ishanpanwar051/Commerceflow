import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getPrisma } from '../src/config/database';
import { OrderService } from '../src/services/orderService';
import { BadRequestError } from '../src/utils/errors';

const prisma = getPrisma();
const orderService = new OrderService();

/**
 * Order State Machine Tests
 *
 * Verifies that the order state machine enforces valid transitions
 * and rejects invalid ones.
 *
 * LEGAL TRANSITIONS:
 *   PENDING    -> CONFIRMED, CANCELLED
 *   CONFIRMED  -> PROCESSING, CANCELLED
 *   PROCESSING -> SHIPPED, CANCELLED
 *   SHIPPED    -> DELIVERED
 *   DELIVERED  -> REFUNDED
 *   CANCELLED  -> (none)
 *   REFUNDED   -> (none)
 */
describe('Order State Machine', () => {
  let testOrderId: string;
  let testUserId: string;
  const TEST_SM_CATEGORY_ID = 'sm-test-category';

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'state-machine-test@example.com' },
      create: {
        email: 'state-machine-test@example.com',
        password: 'hashedpassword',
        firstName: 'State',
        lastName: 'Machine',
      },
      update: {},
    });
    testUserId = user.id;

    // Create a test category (required FK)
    await prisma.category.upsert({
      where: { id: TEST_SM_CATEGORY_ID },
      create: {
        id: TEST_SM_CATEGORY_ID,
        name: 'SM Test Category',
        slug: 'sm-test-category',
        isActive: true,
      },
      update: {},
    });

    // Create a test product + inventory
    await prisma.product.upsert({
      where: { id: 'sm-test-product' },
      create: {
        id: 'sm-test-product',
        name: 'SM Test Product',
        slug: 'sm-test-product',
        sku: 'SM-TEST-001',
        categoryId: TEST_SM_CATEGORY_ID,
        basePrice: 50,
        isActive: true,
      },
      update: {},
    });

    await prisma.inventory.upsert({
      where: { productId: 'sm-test-product' },
      create: {
        productId: 'sm-test-product',
        stock: 100,
        reservedStock: 0,
      },
      update: { stock: 100, reservedStock: 0 },
    });

    // Create a test order in PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber: `SM-TEST-${Date.now()}`,
        userId: testUserId,
        status: 'PENDING',
        subtotal: 50,
        taxAmount: 4,
        grandTotal: 54,
        items: {
          create: {
            productId: 'sm-test-product',
            name: 'SM Test Product',
            price: 50,
            quantity: 1,
            total: 50,
          },
        },
      },
    });
    testOrderId = order.id;

    // Reserve inventory so PROCESSING->SHIPPED fulfillment succeeds
    await prisma.inventory.update({
      where: { productId: 'sm-test-product' },
      data: { reservedStock: { increment: 1 } },
    });
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order.deleteMany({ where: { id: testOrderId } });
    await prisma.inventory.deleteMany({ where: { productId: 'sm-test-product' } });
    await prisma.product.deleteMany({ where: { id: 'sm-test-product' } });
    await prisma.category.deleteMany({ where: { id: TEST_SM_CATEGORY_ID } });
    await prisma.user.deleteMany({ where: { email: 'state-machine-test@example.com' } });
  });

  // ──────────────────────────────────────────────────────
  // Valid transitions
  // ──────────────────────────────────────────────────────
  it('should allow PENDING -> CONFIRMED', async () => {
    const result = await orderService.updateOrderStatus(testOrderId, 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
  });

  it('should allow CONFIRMED -> PROCESSING', async () => {
    const result = await orderService.updateOrderStatus(testOrderId, 'PROCESSING');
    expect(result.status).toBe('PROCESSING');
  });

  it('should allow PROCESSING -> SHIPPED', async () => {
    const result = await orderService.updateOrderStatus(testOrderId, 'SHIPPED');
    expect(result.status).toBe('SHIPPED');
  });

  it('should allow SHIPPED -> DELIVERED', async () => {
    const result = await orderService.updateOrderStatus(testOrderId, 'DELIVERED');
    expect(result.status).toBe('DELIVERED');
    expect(result.deliveredAt).toBeDefined();
  });

  // ──────────────────────────────────────────────────────
  // Invalid transitions (terminal states)
  // ──────────────────────────────────────────────────────
  it('should reject DELIVERED -> CANCELLED', async () => {
    await expect(
      orderService.updateOrderStatus(testOrderId, 'CANCELLED'),
    ).rejects.toThrow(BadRequestError);
  });

  it('should reject DELIVERED -> PENDING', async () => {
    await expect(
      orderService.updateOrderStatus(testOrderId, 'PENDING'),
    ).rejects.toThrow(BadRequestError);
  });

  it('should reject DELIVERED -> SHIPPED', async () => {
    await expect(
      orderService.updateOrderStatus(testOrderId, 'SHIPPED'),
    ).rejects.toThrow(BadRequestError);
  });

  // ──────────────────────────────────────────────────────
  // Invalid status value
  // ──────────────────────────────────────────────────────
  it('should reject an invalid status value', async () => {
    await expect(
      orderService.updateOrderStatus(testOrderId, 'INVALID_STATUS'),
    ).rejects.toThrow(BadRequestError);
  });
});

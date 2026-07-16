import { Prisma } from '@prisma/client';
import { logger } from '../config/logger';
import { BadRequestError } from '../utils/errors';

type TransactionClient = Prisma.TransactionClient;

interface LockedInventoryRow {
  id: string;
  productId: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
}

interface BatchInventoryUpdate {
  productId: string;
  quantity: number;
}

export class InventoryRepository {

  async lockForCheckout(
    tx: TransactionClient,
    productIds: string[],
  ): Promise<LockedInventoryRow[]> {
    if (productIds.length === 0) return [];

    const sortedIds = [...productIds].sort();

    const rows = await tx.$queryRaw<LockedInventoryRow[]>(
      Prisma.sql`
        SELECT "id", "productId", "stock", "reservedStock", "lowStockThreshold"
        FROM "inventory"
        WHERE "productId" IN (${Prisma.join(sortedIds)})
        ORDER BY "productId" ASC
        FOR UPDATE
      `,
    );

    logger.debug(
      { productIds: sortedIds, lockedCount: rows.length },
      'Inventory rows locked for checkout',
    );

    return rows;
  }

  async decrementStock(
    tx: TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<{ stock: number; reservedStock: number }> {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be positive');
    }

    const updated = await tx.$queryRaw<{ stock: number; reservedStock: number }[]>(
      Prisma.sql`
        UPDATE "inventory"
        SET
          "stock" = "stock" - ${quantity},
          "reservedStock" = "reservedStock" + ${quantity},
          "updatedAt" = NOW()
        WHERE "productId" = ${productId}
          AND "stock" >= ${quantity}
        RETURNING "stock", "reservedStock"
      `,
    );

    if (updated.length === 0) {
      logger.error(
        { productId, quantity },
        'Inventory decrement failed: insufficient stock after lock acquisition',
      );
      throw new BadRequestError('Insufficient stock for this product');
    }

    return updated[0];
  }

  async batchDecrement(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    const valueTuples = items.map((item) =>
      Prisma.sql`(${item.productId}::text, ${item.quantity}::int)`,
    );
    const values = Prisma.join(valueTuples, ', ');

    const result = await tx.$executeRaw(
      Prisma.sql`
        UPDATE "inventory" i
        SET
          "stock" = i."stock" - v.quantity,
          "reservedStock" = i."reservedStock" + v.quantity,
          "updatedAt" = NOW()
        FROM (VALUES ${values}) AS v(product_id, quantity)
        WHERE i."productId" = v.product_id
          AND i."stock" >= v.quantity
      `,
    );

    if (result < items.length) {
      logger.error({ items }, 'Batch inventory decrement: some items failed');
      throw new BadRequestError('Insufficient stock for one or more products');
    }
  }

  async releaseReservation(
    tx: TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be positive');
    }

    const updated = await tx.$queryRaw<{ stock: number; reservedStock: number }[]>(
      Prisma.sql`
        UPDATE "inventory"
        SET
          "stock" = "stock" + ${quantity},
          "reservedStock" = "reservedStock" - ${quantity},
          "updatedAt" = NOW()
        WHERE "productId" = ${productId}
          AND "reservedStock" >= ${quantity}
        RETURNING "stock", "reservedStock"
      `,
    );

    if (updated.length === 0) {
      logger.error(
        { productId, quantity },
        'Failed to release inventory reservation: reservedStock may be insufficient',
      );
      throw new BadRequestError('Failed to release inventory reservation');
    }
  }

  async batchReleaseReservation(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    const valueTuples = items.map((item) =>
      Prisma.sql`(${item.productId}::text, ${item.quantity}::int)`,
    );
    const values = Prisma.join(valueTuples, ', ');

    const result = await tx.$executeRaw(
      Prisma.sql`
        UPDATE "inventory" i
        SET
          "stock" = i."stock" + v.quantity,
          "reservedStock" = i."reservedStock" - v.quantity,
          "updatedAt" = NOW()
        FROM (VALUES ${values}) AS v(product_id, quantity)
        WHERE i."productId" = v.product_id
          AND i."reservedStock" >= v.quantity
      `,
    );

    if (result < items.length) {
      logger.error({ items }, 'Batch inventory release: some items failed');
      throw new BadRequestError('Batch inventory release failed: reserved stock insufficient for one or more products');
    }
  }

  async fulfillReservation(
    tx: TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be positive');
    }

    const updated = await tx.$queryRaw<{ stock: number; reservedStock: number }[]>(
      Prisma.sql`
        UPDATE "inventory"
        SET
          "reservedStock" = "reservedStock" - ${quantity},
          "updatedAt" = NOW()
        WHERE "productId" = ${productId}
          AND "reservedStock" >= ${quantity}
        RETURNING "stock", "reservedStock"
      `,
    );

    if (updated.length === 0) {
      logger.error(
        { productId, quantity },
        'Failed to fulfill reservation: reservedStock may be insufficient',
      );
      throw new BadRequestError('Failed to fulfill inventory reservation');
    }
  }

  async batchFulfillReservation(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    const valueTuples = items.map((item) =>
      Prisma.sql`(${item.productId}::text, ${item.quantity}::int)`,
    );
    const values = Prisma.join(valueTuples, ', ');

    const result = await tx.$executeRaw(
      Prisma.sql`
        UPDATE "inventory" i
        SET
          "reservedStock" = i."reservedStock" - v.quantity,
          "updatedAt" = NOW()
        FROM (VALUES ${values}) AS v(product_id, quantity)
        WHERE i."productId" = v.product_id
          AND i."reservedStock" >= v.quantity
      `,
    );

    if (result < items.length) {
      logger.error({ items }, 'Batch inventory fulfill: some items failed');
      throw new BadRequestError('Batch inventory fulfill failed: reserved stock insufficient for one or more products');
    }
  }
}

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

    const rows: LockedInventoryRow[] = [];
    for (const pid of sortedIds) {
      const rowsRaw = await tx.$queryRawUnsafe<LockedInventoryRow[]>(
        'SELECT id, "productId", stock, "reservedStock", "lowStockThreshold" FROM inventory WHERE "productId" = $1 LIMIT 1',
        pid,
      );
      if (rowsRaw.length === 0) throw new BadRequestError(`Inventory not found for product ${pid}`);
      rows.push(rowsRaw[0]);
    }

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

    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory) {
      throw new BadRequestError('Inventory record not found');
    }

    const available = inventory.stock - inventory.reservedStock;
    if (available < quantity) {
      logger.error({ productId, quantity, available }, 'Insufficient stock');
      throw new BadRequestError('Insufficient stock for this product');
    }

    const updated = await tx.inventory.update({
      where: { productId },
      data: {
        stock: { decrement: quantity },
        reservedStock: { increment: quantity },
      },
    });

    return { stock: updated.stock, reservedStock: updated.reservedStock };
  }

  async decrementStockAtomic(
    tx: TransactionClient,
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const result = await tx.$executeRawUnsafe(
      `UPDATE inventory SET stock = stock - $1, "reservedStock" = "reservedStock" + $2 WHERE "productId" = $3 AND stock - "reservedStock" >= $4`,
      quantity,
      quantity,
      productId,
      quantity,
    );
    return result > 0;
  }

  async batchDecrement(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    for (const item of items) {
      await this.decrementStock(tx, item.productId, item.quantity);
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

    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory) {
      throw new BadRequestError('Inventory record not found');
    }

    if (inventory.reservedStock < quantity) {
      logger.error({ productId, quantity, reservedStock: inventory.reservedStock }, 'Insufficient reserved stock');
      throw new BadRequestError('Failed to release inventory reservation');
    }

    await tx.inventory.update({
      where: { productId },
      data: {
        stock: { increment: quantity },
        reservedStock: { decrement: quantity },
      },
    });
  }

  async batchReleaseReservation(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    for (const item of items) {
      await this.releaseReservation(tx, item.productId, item.quantity);
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

    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory) {
      throw new BadRequestError('Inventory record not found');
    }

    if (inventory.reservedStock < quantity) {
      logger.error({ productId, quantity, reservedStock: inventory.reservedStock }, 'Insufficient reserved stock for fulfillment');
      throw new BadRequestError('Failed to fulfill inventory reservation');
    }

    await tx.inventory.update({
      where: { productId },
      data: {
        reservedStock: { decrement: quantity },
      },
    });
  }

  async batchFulfillReservation(
    tx: TransactionClient,
    items: BatchInventoryUpdate[],
  ): Promise<void> {
    if (items.length === 0) return;

    for (const item of items) {
      await this.fulfillReservation(tx, item.productId, item.quantity);
    }
  }
}

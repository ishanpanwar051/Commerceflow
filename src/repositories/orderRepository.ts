import { Prisma, PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database';

const orderInclude = {
  items: { include: { product: { include: { images: true } } } },
  payments: true,
  shippingAddress: true,
  billingAddress: true,
  coupon: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
} satisfies Prisma.OrderInclude;

const orderListInclude = {
  items: { select: { id: true, name: true, price: true, quantity: true, total: true } },
  payments: { select: { amount: true, status: true, createdAt: true } },
  shippingAddress: true,
  billingAddress: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
} satisfies Prisma.OrderInclude;

export class OrderRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: orderInclude });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  }

  async findByUser(userId: string, skip = 0, take = 10) {
    return this.prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: orderListInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countByUser(userId: string) {
    return this.prisma.order.count({ where: { userId, deletedAt: null } });
  }

  async findAll(skip = 0, take = 10, status?: string) {
    const where: Prisma.OrderWhereInput = { deletedAt: null };
    if (status) where.status = status as any;
    return this.prisma.order.findMany({
      where,
      include: orderListInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countAll(status?: string) {
    const where: Prisma.OrderWhereInput = { deletedAt: null };
    if (status) where.status = status as any;
    return this.prisma.order.count({ where });
  }

  async create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({ data, include: orderInclude });
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({ where: { id }, data, include: orderInclude });
  }

  async updateStatus(id: string, status: string) {
    const updateData: Prisma.OrderUpdateInput = { status: status as any };
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();
    return this.prisma.order.update({ where: { id }, data: updateData, include: orderInclude });
  }
}

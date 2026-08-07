import { Prisma, PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database';

const userInclude = {
  addresses: true,
  cart: { include: { items: { include: { product: { include: { images: true } } } } } },
  wishlist: { include: { product: { include: { images: true } } } },
};

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
  }

  async findById(id: string, includeRelations = false) {
    return this.prisma.user.findUnique({
      where: { id },
      ...(includeRelations && { include: userInclude }),
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdentifier(identifier: string) {
    const isEmail = identifier.includes('@');
    return this.prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async createRefreshToken(data: Prisma.RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({ where: { id }, data: { isRevoked: true } });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  // Address management
  async findAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAddressById(id: string, userId: string) {
    return this.prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
  }

  async createAddress(userId: string, data: Prisma.AddressCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: { ...data, user: { connect: { id: userId } } },
      });
    });
  }

  async updateAddress(id: string, userId: string, data: Prisma.AddressUpdateInput) {
    const address = await this.findAddressById(id, userId);
    if (!address) return null;
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({ where: { id }, data });
    });
  }

  async deleteAddress(id: string, userId: string) {
    const address = await this.findAddressById(id, userId);
    if (!address) return null;
    return this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

import { Prisma } from '@prisma/client';
import { getPrisma } from '../config/database';

export { UserRepository } from './userRepository';
export { ProductRepository } from './productRepository';
export { OrderRepository } from './orderRepository';

export class CategoryRepository {
  private prisma = getPrisma();

  async findAll(includeProducts = false) {
    return this.prisma.category.findMany({
      where: { deletedAt: null, isActive: true },
      include: { children: true, ...(includeProducts && { products: { where: { deletedAt: null, isActive: true } } }) },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    });
  }

  async create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findProducts(where: any, skip: number, take: number, sortBy: string, sortOrder: 'asc' | 'desc') {
    return this.prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
        inventory: true,
      },
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async countProducts(where: any) {
    return this.prisma.product.count({ where });
  }
}

export class CartRepository {
  private prisma = getPrisma();

  async findByUser(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: true, inventory: true } } }, orderBy: { createdAt: 'asc' } } },
    });
  }

  async upsert(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: true },
    });
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
    if (!item) return null;
    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  async removeItem(cartId: string, productId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });
    if (!item) return null;
    return this.prisma.cartItem.delete({ where: { id: item.id } });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}

export class WishlistRepository {
  private prisma = getPrisma();

  async findByUser(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addItem(userId: string, productId: string) {
    return this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  }

  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) return null;
    return this.prisma.wishlistItem.delete({ where: { id: item.id } });
  }
}

export class CouponRepository {
  private prisma = getPrisma();

  async findByCode(code: string) {
    return this.prisma.coupon.findFirst({ where: { code, deletedAt: null } });
  }

  async create(data: Prisma.CouponCreateInput) {
    return this.prisma.coupon.create({ data });
  }

  async softDelete(id: string) {
    return this.prisma.coupon.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  async findAll(skip = 0, take = 50) {
    return this.prisma.coupon.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, skip, take });
  }

  async countAll() {
    return this.prisma.coupon.count({ where: { deletedAt: null } });
  }
}

export class ReviewRepository {
  private prisma = getPrisma();

  async findById(id: string) {
    return this.prisma.review.findUnique({ where: { id } });
  }

  async findByProduct(productId: string, skip = 0, take = 10) {
    return this.prisma.review.findMany({
      where: { productId, deletedAt: null, isActive: true },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async countByProduct(productId: string) {
    return this.prisma.review.count({ where: { productId, deletedAt: null, isActive: true } });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  async create(data: Prisma.ReviewCreateInput) {
    return this.prisma.review.create({ data });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput) {
    return this.prisma.review.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.review.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  async getAverageRating(productId: string) {
    const result = await this.prisma.review.aggregate({
      where: { productId, deletedAt: null, isActive: true },
      _avg: { rating: true },
    });
    return result._avg.rating || 0;
  }
}

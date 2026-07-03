import { Prisma, PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database';

const productInclude = {
  images: { orderBy: { order: 'asc' as const } },
  inventory: true,
  category: true,
  reviews: { where: { deletedAt: null, isActive: true }, select: { rating: true } },
  _count: { select: { reviews: { where: { deletedAt: null, isActive: true } } } },
} satisfies Prisma.ProductInclude;

export class ProductRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrisma();
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
  }

  async findBySku(sku: string) {
    return this.prisma.product.findUnique({ where: { sku } });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isFeatured?: boolean;
    cursor?: string;
  }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.minPrice !== undefined && { basePrice: { gte: params.minPrice } }),
      ...(params.maxPrice !== undefined && {
        basePrice: { ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}), lte: params.maxPrice },
      }),
      ...(params.isFeatured !== undefined && { isFeatured: params.isFeatured }),
    };

    if (params.minRating) {
      const productsWithRating = await this.prisma.product.findMany({
        where,
        select: {
          id: true,
          reviews: { where: { deletedAt: null, isActive: true }, select: { rating: true } },
        },
      });
      const validIds = productsWithRating
        .map(p => ({
          id: p.id,
          avgRating: p.reviews.length > 0
            ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
            : 0,
        }))
        .filter(p => p.avgRating >= (params.minRating || 0))
        .map(p => p.id);

      where.id = { in: validIds };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (params.sort === 'rating') {
      orderBy.reviews = { _count: params.order || 'desc' };
    } else {
      (orderBy as any)[params.sort || 'createdAt'] = params.order || 'desc';
    }

    if (params.cursor) {
      return this.prisma.product.findMany({
        take: params.take || 10,
        skip: 1,
        cursor: { id: params.cursor },
        where,
        include: productInclude,
        orderBy,
      });
    }

    return this.prisma.product.findMany({
      skip: params.skip || 0,
      take: params.take || 10,
      where,
      include: productInclude,
      orderBy,
    });
  }

  async count(params: { search?: string; categoryId?: string; minPrice?: number; maxPrice?: number }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.minPrice !== undefined && { basePrice: { gte: params.minPrice } }),
      ...(params.maxPrice !== undefined && { basePrice: { lte: params.maxPrice } }),
    };
    return this.prisma.product.count({ where });
  }

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: productInclude });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data, include: productInclude });
  }

  async softDelete(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async createImage(data: Prisma.ProductImageCreateInput) {
    return this.prisma.productImage.create({ data });
  }

  async deleteImage(id: string) {
    return this.prisma.productImage.delete({ where: { id } });
  }

  async updateInventory(productId: string, stock: number, lowStockThreshold?: number) {
    return this.prisma.inventory.upsert({
      where: { productId },
      update: { stock, ...(lowStockThreshold !== undefined && { lowStockThreshold }) },
      create: { productId, stock, lowStockThreshold: lowStockThreshold || 5 },
    });
  }

  async getLowStockProducts() {
    return this.prisma.inventory.findMany({
      where: {
        stock: { lte: 5 },
        product: { isActive: true, deletedAt: null },
      },
      include: { product: { include: { images: true } } },
    });
  }
}

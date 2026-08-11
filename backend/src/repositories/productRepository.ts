import { Prisma, PrismaClient } from '@prisma/client';
import { getPrisma } from '../config/database';

const productInclude = {
  images: { orderBy: { order: 'asc' as const } },
  inventory: true,
  category: true,
  _count: { select: { reviews: { where: { deletedAt: null, isActive: true } } } },
} satisfies Prisma.ProductInclude;

const productIncludeListing = {
  images: { orderBy: { order: 'asc' as const }, take: 2 },
  inventory: { select: { stock: true, reservedStock: true, lowStockThreshold: true } },
  category: true,
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
    brand?: string;
    categoryId?: string;
    categoryIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    minDiscount?: number;
    maxRating?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isTopRated?: boolean;
    freeDelivery?: boolean;
    cashOnDelivery?: boolean;
    emiAvailable?: boolean;
    cursor?: string;
  }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { brand: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
          { tags: { array_contains: params.search } },
        ],
      }),
      ...(params.brand && { brand: { in: params.brand.split(',') } }),
      ...(params.categoryIds?.length
        ? { categoryId: { in: params.categoryIds } }
        : params.categoryId && { categoryId: params.categoryId }),
      ...(params.minPrice !== undefined && params.maxPrice !== undefined
        ? { basePrice: { gte: params.minPrice, lte: params.maxPrice } }
        : {
            ...(params.minPrice !== undefined && { basePrice: { gte: params.minPrice } }),
            ...(params.maxPrice !== undefined && { basePrice: { lte: params.maxPrice } }),
          }),
      ...(params.isFeatured !== undefined && { isFeatured: params.isFeatured }),
      ...(params.isBestSeller !== undefined && { isBestSeller: params.isBestSeller }),
      ...(params.isNewArrival !== undefined && { isNewArrival: params.isNewArrival }),
      ...(params.isTopRated !== undefined && { isTopRated: params.isTopRated }),
      ...(params.freeDelivery !== undefined && { freeDelivery: params.freeDelivery }),
      ...(params.cashOnDelivery !== undefined && { cashOnDelivery: params.cashOnDelivery }),
      ...(params.emiAvailable !== undefined && { emiAvailable: params.emiAvailable }),
      ...(params.minRating !== undefined && { averageRating: { gte: params.minRating } }),
      ...(params.minDiscount !== undefined && { discountPercent: { gte: params.minDiscount } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (params.sort === 'rating' || params.sort === 'averageRating') {
      orderBy.averageRating = params.order || 'desc';
    } else if (params.sort === 'popularity' || params.sort === 'soldCount') {
      orderBy.soldCount = params.order || 'desc';
    } else if (params.sort === 'trending' || params.sort === 'trendingScore') {
      orderBy.trendingScore = params.order || 'desc';
    } else if (params.sort === 'discount' || params.sort === 'discountPercent') {
      orderBy.discountPercent = params.order || 'desc';
    } else {
      (orderBy as any)[params.sort || 'createdAt'] = params.order || 'desc';
    }

    if (params.cursor) {
      return this.prisma.product.findMany({
        take: params.take || 10,
        skip: 1,
        cursor: { id: params.cursor },
        where,
        include: productIncludeListing,
        orderBy,
      });
    }

    return this.prisma.product.findMany({
      skip: params.skip || 0,
      take: params.take || 10,
      where,
      include: productIncludeListing,
      orderBy,
    });
  }

  async count(params: {
    search?: string;
    brand?: string;
    categoryId?: string;
    categoryIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    minDiscount?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isTopRated?: boolean;
    freeDelivery?: boolean;
    cashOnDelivery?: boolean;
    emiAvailable?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { brand: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.brand && { brand: { in: params.brand.split(',') } }),
      ...(params.categoryIds?.length
        ? { categoryId: { in: params.categoryIds } }
        : params.categoryId && { categoryId: params.categoryId }),
      ...(params.minPrice !== undefined && params.maxPrice !== undefined
        ? { basePrice: { gte: params.minPrice, lte: params.maxPrice } }
        : {
            ...(params.minPrice !== undefined && { basePrice: { gte: params.minPrice } }),
            ...(params.maxPrice !== undefined && { basePrice: { lte: params.maxPrice } }),
          }),
      ...(params.minRating !== undefined && { averageRating: { gte: params.minRating } }),
      ...(params.minDiscount !== undefined && { discountPercent: { gte: params.minDiscount } }),
      ...(params.isFeatured !== undefined && { isFeatured: params.isFeatured }),
      ...(params.isBestSeller !== undefined && { isBestSeller: params.isBestSeller }),
      ...(params.isNewArrival !== undefined && { isNewArrival: params.isNewArrival }),
      ...(params.isTopRated !== undefined && { isTopRated: params.isTopRated }),
      ...(params.freeDelivery !== undefined && { freeDelivery: params.freeDelivery }),
      ...(params.cashOnDelivery !== undefined && { cashOnDelivery: params.cashOnDelivery }),
      ...(params.emiAvailable !== undefined && { emiAvailable: params.emiAvailable }),
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

  async findImage(id: string) {
    return this.prisma.productImage.findUnique({ where: { id } });
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

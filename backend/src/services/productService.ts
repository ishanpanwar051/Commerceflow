import { ProductRepository, CategoryRepository } from '../repositories';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { slugify, dollarsToCents } from '../utils/helpers';
import { invalidateCache } from '../middleware/cache';
import { getPrisma } from '../config/database';
import { Prisma } from '@prisma/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

interface UpdateProductData {
  name?: string;
  description?: string;
  longDescription?: string;
  basePrice?: number;
  originalPrice?: number;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  brand?: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  warranty?: string;
  countryOfOrigin?: string;
  sellerName?: string;
  returnPolicy?: string;
  deliveryEstimate?: string;
  freeDelivery?: boolean;
  cashOnDelivery?: boolean;
  emiAvailable?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTopRated?: boolean;
  tags?: string[];
  keyFeatures?: string[];
  specifications?: Record<string, string>;
  whatsInTheBox?: string[];
  videoUrl?: string;
  discountPercent?: number;
}

export class ProductService {
  private productRepo: ProductRepository;
  private categoryRepo: CategoryRepository;

  constructor() {
    this.productRepo = new ProductRepository();
    this.categoryRepo = new CategoryRepository();
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    brand?: string;
    categoryId?: string;
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
    cursor?: string;
  }) {
    const skip = params.page && params.limit ? (params.page - 1) * params.limit : undefined;

    const priceFilter = params.minPrice || params.maxPrice
      ? {
          minPrice: params.minPrice ? dollarsToCents(params.minPrice) : undefined,
          maxPrice: params.maxPrice ? dollarsToCents(params.maxPrice) : undefined,
        }
      : {};

    // Browsing a parent category should also show products from its
    // descendant subcategories (e.g. "Electronics" includes Phones, Laptops...).
    const categoryIds = params.categoryId
      ? await this.getCategoryWithDescendants(params.categoryId)
      : undefined;

    const [products, total] = await Promise.all([
      this.productRepo.findAll({
        skip,
        take: params.limit || 20,
        sort: params.sort,
        order: params.order,
        search: params.search,
        brand: params.brand,
        categoryId: params.categoryId,
        categoryIds,
        ...priceFilter,
        minRating: params.minRating,
        minDiscount: params.minDiscount,
        isFeatured: params.isFeatured,
        isBestSeller: params.isBestSeller,
        isNewArrival: params.isNewArrival,
        isTopRated: params.isTopRated,
        freeDelivery: params.freeDelivery,
        cashOnDelivery: params.cashOnDelivery,
        emiAvailable: params.emiAvailable,
        cursor: params.cursor,
      }),
      this.productRepo.count({
        search: params.search,
        brand: params.brand,
        categoryId: params.categoryId,
        categoryIds,
        ...priceFilter,
        minRating: params.minRating,
        minDiscount: params.minDiscount,
        isBestSeller: params.isBestSeller,
        isNewArrival: params.isNewArrival,
        isTopRated: params.isTopRated,
        freeDelivery: params.freeDelivery,
        cashOnDelivery: params.cashOnDelivery,
        emiAvailable: params.emiAvailable,
      }),
    ]);

    const productsWithRating = products.map((p) => {
      const { reviews: _, _count: count, ...rest } = p as Record<string, unknown> & { reviews?: unknown; _count?: unknown };
      return {
        ...rest,
        averageRating: rest.averageRating || 0,
        reviewCount: ((count as { reviews?: number })?.reviews || 0),
      };
    });

    return { products: productsWithRating, total };
  }

  async getProduct(idOrSlug: string) {
    const product = isUuid(idOrSlug)
      ? await this.productRepo.findById(idOrSlug)
      : await this.productRepo.findBySlug(idOrSlug);

    if (!product || product.deletedAt) throw new NotFoundError('Product');

    const { reviews: _, _count: count, ...rest } = product as Record<string, unknown> & { reviews?: unknown; _count?: unknown };
    return {
      ...rest,
      averageRating: rest.averageRating || 0,
      reviewCount: ((count as { reviews?: number })?.reviews || 0),
    };
  }

  private async getCategoryWithDescendants(categoryId: string): Promise<string[]> {
    const all = await this.categoryRepo.findAll();
    const ids = new Set<string>([categoryId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of all) {
        if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
          ids.add(c.id);
          changed = true;
        }
      }
    }
    return [...ids];
  }

  async createProduct(data: {
    name: string;
    description?: string;
    basePrice: number;
    sku: string;
    barcode?: string;
    categoryId: string;
    isFeatured?: boolean;
    stock?: number;
    lowStockThreshold?: number;
  }) {
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) throw new BadRequestError('Category not found');

    const existingSku = await this.productRepo.findBySku(data.sku);
    if (existingSku) throw new BadRequestError('SKU already exists');

    const generatedSlug = slugify(data.name);

    const product = await this.productRepo.create({
      name: data.name,
      slug: generatedSlug,
      description: data.description,
      basePrice: dollarsToCents(data.basePrice),
      sku: data.sku,
      barcode: data.barcode,
      isFeatured: data.isFeatured || false,
      category: { connect: { id: data.categoryId } },
      inventory: {
        create: {
          stock: data.stock || 0,
          lowStockThreshold: data.lowStockThreshold || 5,
        },
      },
    });

    await invalidateCache('/api/v1/products*');
    return product;
  }

  async updateProduct(id: string, data: UpdateProductData) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundError('Product');

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.basePrice !== undefined) updateData.basePrice = dollarsToCents(data.basePrice);
    if (data.originalPrice !== undefined) updateData.originalPrice = dollarsToCents(data.originalPrice);
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;
    if (data.material !== undefined) updateData.material = data.material;
    if (data.warranty !== undefined) updateData.warranty = data.warranty;
    if (data.countryOfOrigin !== undefined) updateData.countryOfOrigin = data.countryOfOrigin;
    if (data.sellerName !== undefined) updateData.sellerName = data.sellerName;
    if (data.returnPolicy !== undefined) updateData.returnPolicy = data.returnPolicy;
    if (data.deliveryEstimate !== undefined) updateData.deliveryEstimate = data.deliveryEstimate;
    if (data.freeDelivery !== undefined) updateData.freeDelivery = data.freeDelivery;
    if (data.cashOnDelivery !== undefined) updateData.cashOnDelivery = data.cashOnDelivery;
    if (data.emiAvailable !== undefined) updateData.emiAvailable = data.emiAvailable;
    if (data.isNewArrival !== undefined) updateData.isNewArrival = data.isNewArrival;
    if (data.isBestSeller !== undefined) updateData.isBestSeller = data.isBestSeller;
    if (data.isTopRated !== undefined) updateData.isTopRated = data.isTopRated;
    if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.keyFeatures !== undefined) updateData.keyFeatures = data.keyFeatures;
    if (data.specifications !== undefined) updateData.specifications = data.specifications;
    if (data.whatsInTheBox !== undefined) updateData.whatsInTheBox = data.whatsInTheBox;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.longDescription !== undefined) updateData.longDescription = data.longDescription;

    const prisma = getPrisma();

    const updated = await prisma.$transaction(async (tx) => {
      const productUpdate = await this.productRepo.update(id, updateData);

      if (data.stock !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          update: { stock: data.stock, ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }) },
          create: { productId: id, stock: data.stock, lowStockThreshold: data.lowStockThreshold || 5 },
        });
      }

      return productUpdate;
    });

    await invalidateCache('/api/v1/products*');
    return updated;
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundError('Product');
    await this.productRepo.softDelete(id);
    await invalidateCache('/api/v1/products*');
  }

  async addImage(productId: string, url: string, alt?: string, order = 0) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestError('Invalid image URL');
    }
    if (parsed.protocol !== 'https:') {
      throw new BadRequestError('Image URL must use HTTPS');
    }
    if (url.length > 2048) {
      throw new BadRequestError('Image URL is too long');
    }
    return this.productRepo.createImage({
      url,
      alt,
      order,
      product: { connect: { id: productId } },
    });
  }

  async deleteImage(imageId: string) {
    await this.productRepo.deleteImage(imageId);
    await invalidateCache('/api/v1/products*');
  }
}

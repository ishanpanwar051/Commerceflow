import { ProductRepository, CategoryRepository } from '../repositories';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { slugify } from '../utils/helpers';
import { invalidateCache } from '../middleware/cache';
import { Prisma } from '@prisma/client';

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
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isFeatured?: boolean;
    cursor?: string;
  }) {
    const skip = params.page && params.limit ? (params.page - 1) * params.limit : undefined;

    const [products, total] = await Promise.all([
      this.productRepo.findAll({
        skip,
        take: params.limit || 10,
        sort: params.sort,
        order: params.order,
        search: params.search,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minRating: params.minRating,
        isFeatured: params.isFeatured,
        cursor: params.cursor,
      }),
      this.productRepo.count({
        search: params.search,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      }),
    ]);

    const productsWithRating = products.map((p) => {
      const reviews = p.reviews as any[];
      const avgRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0;
      const { reviews: _, ...rest } = p;
      return { ...rest, averageRating: avgRating, reviewCount: (p as any)._count?.reviews || 0 };
    });

    return { products: productsWithRating, total };
  }

  async getProduct(idOrSlug: string) {
    const product = idOrSlug.includes('-')
      ? await this.productRepo.findBySlug(idOrSlug)
      : await this.productRepo.findById(idOrSlug);

    if (!product || product.deletedAt) throw new NotFoundError('Product');

    const reviews = product.reviews as any[];
    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;
    const { reviews: _, ...rest } = product;
    return { ...rest, averageRating: avgRating, reviewCount: (product as any)._count?.reviews || 0 };
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

    const slug = slugify(data.name);

    const product = await this.productRepo.create({
      name: data.name,
      slug,
      description: data.description,
      basePrice: data.basePrice,
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

    await invalidateCache('products:*');
    return product;
  }

  async updateProduct(id: string, data: any) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundError('Product');

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    const updated = await this.productRepo.update(id, updateData);

    if (data.stock !== undefined) {
      await this.productRepo.updateInventory(id, data.stock, data.lowStockThreshold);
    }

    await invalidateCache('products:*');
    return updated;
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundError('Product');
    await this.productRepo.softDelete(id);
    await invalidateCache('products:*');
  }

  async addImage(productId: string, url: string, alt?: string, order = 0) {
    return this.productRepo.createImage({
      url,
      alt,
      order,
      product: { connect: { id: productId } },
    });
  }

  async deleteImage(imageId: string) {
    await this.productRepo.deleteImage(imageId);
  }
}

import { CategoryRepository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { slugify } from '../utils/helpers';
import { invalidateCache } from '../middleware/cache';
import { getPrisma } from '../config/database';

export class CategoryService {
  private repo: CategoryRepository;

  constructor() {
    this.repo = new CategoryRepository();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async getBySlug(slug: string) {
    const category = await this.repo.findBySlug(slug);
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async create(data: { name: string; description?: string; parentId?: string | null; image?: string }) {
    const category = await this.repo.create({
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
      ...(data.image && { image: data.image }),
    });
    await invalidateCache('/api/v1/products*');
    return category;
  }

  async update(id: string, data: any) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError('Category');

    const updateData: any = {};
    if (data.name) { updateData.name = data.name; updateData.slug = slugify(data.name); }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.parentId !== undefined) {
      updateData.parent = data.parentId ? { connect: { id: data.parentId } } : { disconnect: true };
    }

    const updated = await this.repo.update(id, updateData);
    await invalidateCache('/api/v1/products*');
    return updated;
  }

  async delete(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError('Category');
    await this.repo.softDelete(id);
    await invalidateCache('/api/v1/products*');
  }

  /**
   * Recursively get all child category IDs for a given category ID.
   * This ensures products from subcategories are also included.
   */
  private async getAllDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const prisma = getPrisma();
    const ids: string[] = [categoryId];
    
    // Get direct children
    const children = await prisma.category.findMany({
      where: { parentId: categoryId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    
    for (const child of children) {
      const descendantIds = await this.getAllDescendantCategoryIds(child.id);
      ids.push(...descendantIds);
    }
    
    return ids;
  }

  async getProducts(categoryId: string, options: {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const category = await this.repo.findById(categoryId);
    if (!category) throw new NotFoundError('Category');

    const { page, limit, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Get all category IDs including this category and all its descendants
    const allCategoryIds = await this.getAllDescendantCategoryIds(categoryId);

    const where: any = {
      categoryId: { in: allCategoryIds },
      isActive: true,
      deletedAt: null,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
      this.repo.findProducts(where, skip, limit, sortBy, sortOrder),
      this.repo.countProducts(where),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

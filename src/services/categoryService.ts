import { CategoryRepository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { slugify } from '../utils/helpers';
import { invalidateCache } from '../middleware/cache';

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

  async create(data: { name: string; description?: string; parentId?: string | null; image?: string }) {
    const category = await this.repo.create({
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
      ...(data.image && { image: data.image }),
    });
    await invalidateCache('products:*');
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
    await invalidateCache('products:*');
    return updated;
  }

  async delete(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundError('Category');
    await this.repo.softDelete(id);
    await invalidateCache('products:*');
  }
}

import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { sendSuccess } from '../utils/helpers';

const categoryService = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      sendSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(req.params.id as string);
      sendSuccess(res, category, 'Category fetched successfully');
    } catch (error) { next(error); }
  }

  async getBySlugOrId(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.params.idOrSlug as string;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const category = uuidRegex.test(identifier)
        ? await categoryService.getById(identifier)
        : await categoryService.getBySlug(identifier);
      sendSuccess(res, category, 'Category fetched successfully');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(req.params.id as string, req.body);
      sendSuccess(res, category, 'Category updated successfully');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(req.params.id as string);
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) { next(error); }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const result = await categoryService.getProducts(id, {
        page,
        limit,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      });

      sendSuccess(res, result.data, 'Products fetched successfully', 200, result.pagination);
    } catch (error) { next(error); }
  }
}

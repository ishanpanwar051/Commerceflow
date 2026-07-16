import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const validated = req.query as Record<string, unknown>;
      const { products, total } = await productService.getProducts({
        page: (validated.page as number) || 1,
        limit: (validated.limit as number) || 20,
        sort: validated.sort as string,
        order: validated.order as 'asc' | 'desc',
        search: validated.search as string,
        brand: validated.brand as string,
        categoryId: validated.categoryId as string,
        minPrice: validated.minPrice as number | undefined,
        maxPrice: validated.maxPrice as number | undefined,
        minRating: validated.minRating as number | undefined,
        isFeatured: validated.isFeatured as boolean | undefined,
        isBestSeller: validated.isBestSeller as boolean | undefined,
        isNewArrival: validated.isNewArrival as boolean | undefined,
        isTopRated: validated.isTopRated as boolean | undefined,
        freeDelivery: validated.freeDelivery as boolean | undefined,
        cashOnDelivery: validated.cashOnDelivery as boolean | undefined,
        emiAvailable: validated.emiAvailable as boolean | undefined,
      });
      sendSuccess(res, products, 'Products fetched successfully', 200, calculatePaginationMeta(total, page, limit));
    } catch (error) { next(error); }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProduct(req.params.idOrSlug as string);
      sendSuccess(res, product, 'Product fetched successfully');
    } catch (error) { next(error); }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);
      sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) { next(error); }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProduct(req.params.id as string, req.body);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) { next(error); }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id as string);
      sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) { next(error); }
  }

  async addImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, alt, order } = req.body;
      const image = await productService.addImage(req.params.id as string, url, alt, order);
      sendSuccess(res, image, 'Image added successfully', 201);
    } catch (error) { next(error); }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteImage(req.params.imageId as string);
      sendSuccess(res, null, 'Image deleted successfully');
    } catch (error) { next(error); }
  }
}

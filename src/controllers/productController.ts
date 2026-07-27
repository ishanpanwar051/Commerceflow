import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const { products, total } = await productService.getProducts({
        page: (query.page as number) || 1,
        limit: (query.limit as number) || 20,
        sort: query.sort as string,
        order: query.order as 'asc' | 'desc',
        search: query.search as string,
        brand: query.brand as string,
        categoryId: query.categoryId as string,
        minPrice: query.minPrice as number | undefined,
        maxPrice: query.maxPrice as number | undefined,
        minRating: query.minRating as number | undefined,
        isFeatured: query.isFeatured as boolean | undefined,
        isBestSeller: query.isBestSeller as boolean | undefined,
        isNewArrival: query.isNewArrival as boolean | undefined,
        isTopRated: query.isTopRated as boolean | undefined,
        freeDelivery: query.freeDelivery as boolean | undefined,
        cashOnDelivery: query.cashOnDelivery as boolean | undefined,
        emiAvailable: query.emiAvailable as boolean | undefined,
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

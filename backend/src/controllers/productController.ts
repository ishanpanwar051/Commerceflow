import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      
      const { products, total } = await productService.getProducts({
        page,
        limit,
        sort: query.sort as string,
        order: query.order as 'asc' | 'desc',
        search: query.search as string,
        brand: query.brand as string,
        categoryId: query.categoryId as string,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        minRating: query.minRating ? Number(query.minRating) : undefined,
        isFeatured: query.isFeatured === undefined ? undefined : query.isFeatured === 'true',
        isBestSeller: query.isBestSeller === undefined ? undefined : query.isBestSeller === 'true',
        isNewArrival: query.isNewArrival === undefined ? undefined : query.isNewArrival === 'true',
        isTopRated: query.isTopRated === undefined ? undefined : query.isTopRated === 'true',
        freeDelivery: query.freeDelivery === undefined ? undefined : query.freeDelivery === 'true',
        cashOnDelivery: query.cashOnDelivery === undefined ? undefined : query.cashOnDelivery === 'true',
        emiAvailable: query.emiAvailable === undefined ? undefined : query.emiAvailable === 'true',
      });
      sendSuccess(res, products, 'Products fetched successfully', 200, calculatePaginationMeta(total, page, limit));
    } catch (error) { next(error); }
  }

  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query || req.query.q || req.query.search;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const { products, total } = await productService.getProducts({
        page,
        limit,
        search: query as string,
      });

      sendSuccess(res, products, 'Search results fetched successfully', 200, calculatePaginationMeta(total, page, limit));
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

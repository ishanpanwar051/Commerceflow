import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  basePrice: z.number().positive('Price must be positive'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  isFeatured: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional().default(0),
  lowStockThreshold: z.number().int().nonnegative().optional().default(5),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['name', 'basePrice', 'createdAt', 'rating', 'popularity', 'trending', 'discountPercent', 'soldCount']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  minDiscount: z.coerce.number().min(0).max(100).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isTopRated: z.coerce.boolean().optional(),
  freeDelivery: z.coerce.boolean().optional(),
  cashOnDelivery: z.coerce.boolean().optional(),
  emiAvailable: z.coerce.boolean().optional(),
});

export const productCursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['name', 'basePrice', 'createdAt', 'rating']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

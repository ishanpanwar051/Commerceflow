export * from './auth';
export * from './product';

import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().optional().default('US'),
  isDefault: z.boolean().optional().default(false),
  isBilling: z.boolean().optional().default(false),
  isShipping: z.boolean().optional().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  image: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(100),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive').max(100),
});

export const wishlistItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(20).transform(v => v.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').transform(v => v.toUpperCase()),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid('Invalid address ID'),
  billingAddressId: z.string().uuid('Invalid address ID').optional(),
  couponCode: z.string().optional().transform(v => v?.toUpperCase()),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

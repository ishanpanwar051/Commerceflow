import apiClient from '@/lib/axios';
import type { ApiResponse, Product, Category, Review, PaginationMeta } from '@/types/api';

interface ProductQueryParams {
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
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTopRated?: boolean;
  freeDelivery?: boolean;
  cashOnDelivery?: boolean;
  emiAvailable?: boolean;
}

export const productService = {
  async getProducts(params: ProductQueryParams = {}) {
    const { data } = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return { products: data.data!, meta: data.meta as PaginationMeta };
  },

  async getProduct(idOrSlug: string) {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${idOrSlug}`);
    return data.data!;
  },

  async createProduct(payload: FormData | Record<string, unknown>) {
    const isFormData = payload instanceof FormData;
    const { data } = await apiClient.post<ApiResponse<Product>>('/products', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return data.data!;
  },

  async updateProduct(id: string, payload: Record<string, unknown>) {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data!;
  },

  async deleteProduct(id: string) {
    await apiClient.delete(`/products/${id}`);
  },

  async addImage(productId: string, url: string, alt?: string, order?: number) {
    const { data } = await apiClient.post(`/products/${productId}/images`, { url, alt, order });
    return data.data;
  },

  async deleteImage(productId: string, imageId: string) {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },

  async getCategories() {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return data.data!;
  },

  async getCategory(id: string) {
    const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return data.data!;
  },

  async createCategory(payload: { name: string; description?: string; parentId?: string; image?: string }) {
    const { data } = await apiClient.post<ApiResponse<Category>>('/categories', payload);
    return data.data!;
  },

  async updateCategory(id: string, payload: Partial<{ name: string; description: string; isActive: boolean; image: string }>) {
    const { data } = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
    return data.data!;
  },

  async deleteCategory(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },

  async getReviews(productId: string, page = 1, limit = 10) {
    const { data } = await apiClient.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`, { params: { page, limit } });
    return { reviews: data.data!, meta: data.meta as PaginationMeta };
  },

  async createReview(productId: string, payload: { rating: number; title?: string; comment?: string }) {
    const { data } = await apiClient.post<ApiResponse<Review>>(`/reviews/product/${productId}`, payload);
    return data.data!;
  },

  async updateReview(id: string, payload: Partial<{ rating: number; title: string; comment: string }>) {
    const { data } = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, payload);
    return data.data!;
  },

  async deleteReview(id: string) {
    await apiClient.delete(`/reviews/${id}`);
  },
};

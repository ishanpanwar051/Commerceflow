import apiClient from '@/lib/axios';
import type { ApiResponse, User, Order, Coupon, Review, PaginationMeta, ChurnResponse } from '@/types/api';

export const adminService = {
  async getDashboardStats() {
    const { data } = await apiClient.get<ApiResponse<{
      revenue: number;
      totalOrders: number;
      totalProducts: number;
      totalCustomers: number;
      recentOrders: Order[];
      monthlySales: { month: string; revenue: number }[];
      topProducts: { id: string; name: string; sales: number; revenue: number }[];
      categoryDistribution: { category: string; count: number }[];
    }>>('/admin/dashboard');
    return data.data!;
  },

  async getUsers(page = 1, limit = 10, search?: string) {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/admin/users', { params: { page, limit, search } });
    return { users: data.data!, meta: data.meta as PaginationMeta };
  },

  async updateUserRole(userId: string, role: 'ADMIN' | 'CUSTOMER') {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
    return data.data!;
  },

  async toggleUserStatus(userId: string) {
    const { data } = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/toggle-status`);
    return data.data!;
  },

  async getAllReviews(page = 1, limit = 10) {
    const { data } = await apiClient.get<ApiResponse<Review[]>>('/admin/reviews', { params: { page, limit } });
    return { reviews: data.data!, meta: data.meta as PaginationMeta };
  },

  async getAllCoupons() {
    const { data } = await apiClient.get<ApiResponse<Coupon[]>>('/coupons');
    return data.data!;
  },

  async createCoupon(payload: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>) {
    const { data } = await apiClient.post<ApiResponse<Coupon>>('/coupons', payload);
    return data.data!;
  },

  async deleteCoupon(id: string) {
    await apiClient.delete(`/coupons/${id}`);
  },

  async getInventory() {
    const { data } = await apiClient.get<ApiResponse<Array<{ id: string; productId: string; product: { name: string; sku: string }; stock: number; reservedStock: number; lowStockThreshold: number }>>>('/admin/inventory');
    return data.data!;
  },

  async updateInventory(productId: string, stock: number, lowStockThreshold?: number) {
    const { data } = await apiClient.patch<ApiResponse>(`/admin/inventory/${productId}`, { stock, lowStockThreshold });
    return data.data;
  },

  async getChurnPredictions(forceRetrain = false) {
    const { data } = await apiClient.get<ApiResponse<ChurnResponse>>('/churn/predictions', { params: { forceRetrain } });
    return data.data!;
  },
};

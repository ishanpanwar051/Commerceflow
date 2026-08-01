import apiClient from '@/lib/axios';
import type { ApiResponse, Order, PaginationMeta } from '@/types/api';

export const orderService = {
  async checkout(payload: { shippingAddressId: string; billingAddressId?: string; couponCode?: string; notes?: string }) {
    const { data } = await apiClient.post<ApiResponse<{ order: Order; paymentIntent: { clientSecret: string; paymentIntentId: string; amount: number } | null }>>('/orders/checkout', payload);
    return data.data!;
  },

  async getOrders(page = 1, limit = 10) {
    const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders', { params: { page, limit } });
    return { orders: data.data!, meta: data.meta as PaginationMeta };
  },

  async getOrder(id: string) {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data!;
  },

  async trackOrder(orderNumber: string) {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/track/${encodeURIComponent(orderNumber)}`);
    return data.data!;
  },

  async cancelOrder(id: string, reason?: string) {
    const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
    return data.data!;
  },

  // Admin
  async getAllOrders(page = 1, limit = 10, status?: string) {
    const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders/admin/all', { params: { page, limit, status } });
    return { orders: data.data!, meta: data.meta as PaginationMeta };
  },

  async getOrderAdmin(id: string) {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/admin/${id}`);
    return data.data!;
  },

  async updateOrderStatus(id: string, status: string) {
    const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/admin/${id}/status`, { status });
    return data.data!;
  },
};

import apiClient from '@/lib/axios';
import type { ApiResponse, Cart } from '@/types/api';

export const cartService = {
  async getCart() {
    const { data } = await apiClient.get<ApiResponse<Cart>>('/cart');
    return data.data!;
  },

  async addItem(productId: string, quantity: number) {
    const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    return data.data!;
  },

  async updateItemQuantity(productId: string, quantity: number) {
    const { data } = await apiClient.patch<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity });
    return data.data!;
  },

  async removeItem(productId: string) {
    const { data } = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);
    return data.data!;
  },

  async clearCart() {
    const { data } = await apiClient.delete<ApiResponse<Cart>>('/cart');
    return data.data!;
  },

  async applyCoupon(code: string) {
    const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/apply-coupon', { code });
    return data.data!;
  },
};

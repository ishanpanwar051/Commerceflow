import apiClient from '@/lib/axios';
import type { ApiResponse, WishlistItem } from '@/types/api';

export const wishlistService = {
  async getWishlist() {
    const { data } = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist');
    return data.data!;
  },

  async addItem(productId: string) {
    const { data } = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist', { productId });
    return data.data!;
  },

  async removeItem(productId: string) {
    await apiClient.delete(`/wishlist/${productId}`);
  },
};

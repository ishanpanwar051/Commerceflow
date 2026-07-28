import apiClient from '@/lib/axios';
import type { ApiResponse, Address } from '@/types/api';

export const addressService = {
  async getAddresses() {
    const { data } = await apiClient.get<ApiResponse<Address[]>>('/users/addresses');
    return data.data!;
  },

  async createAddress(payload: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const { data } = await apiClient.post<ApiResponse<Address>>('/users/addresses', payload);
    return data.data!;
  },

  async updateAddress(id: string, payload: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    const { data } = await apiClient.patch<ApiResponse<Address>>(`/users/addresses/${id}`, payload);
    return data.data!;
  },

  async deleteAddress(id: string) {
    await apiClient.delete(`/users/addresses/${id}`);
  },
};

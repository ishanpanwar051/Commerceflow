import apiClient from '@/lib/axios';
import type { ApiResponse, Payment } from '@/types/api';

export const paymentService = {
  async createPaymentIntent(orderId: string) {
    const { data } = await apiClient.post<ApiResponse<{ clientSecret: string; paymentIntentId: string; amount: number }>>('/payments/create-payment-intent', { orderId });
    return data.data!;
  },

  async confirmPayment(paymentIntentId: string) {
    const { data } = await apiClient.post<ApiResponse>('/payments/confirm', { paymentIntentId });
    return data.data;
  },

  async getPaymentHistory(page = 1, limit = 10) {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>('/payments/history', { params: { page, limit } });
    return { payments: data.data!, meta: data.meta };
  },
};

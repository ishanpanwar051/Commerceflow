import apiClient from '@/lib/axios';
import type { ApiResponse, LoginResponse, RegisterResponse, User } from '@/types/api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return data.data!;
  },

  async register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    const { data } = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload);
    return data.data!;
  },

  async refresh(refreshToken: string) {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
    return data.data!;
  },

  async logout(refreshToken?: string) {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/reset-password', { token, password });
    return data;
  },

  async verifyEmail(token: string) {
    const { data } = await apiClient.post<ApiResponse>(`/auth/verify-email/${token}`);
    return data;
  },

  async resendVerification() {
    const { data } = await apiClient.post<ApiResponse>('/auth/resend-verification');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await apiClient.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword });
    return data;
  },

  async getProfile() {
    const { data } = await apiClient.get<ApiResponse<User>>('/users/profile');
    return data.data!;
  },

  async updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) {
    const { data } = await apiClient.patch<ApiResponse<User>>('/users/profile', payload);
    return data.data!;
  },

  async uploadAvatar(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data!;
  },

  async deleteAccount() {
    await apiClient.delete('/users/account');
  },
};

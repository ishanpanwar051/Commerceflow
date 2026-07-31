import apiClient from '@/lib/axios';
import { handleApiError } from '@/lib/api-error-handler';
import type { ApiResponse, LoginResponse, RegisterResponse, User } from '@/types/api';

export const authService = {
  async login(email: string, password: string) {
    try {
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
      return data.data!;
    } catch (error) {
      handleApiError(error, 'Login failed');
      throw error;
    }
  },

  async register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    try {
      const { data } = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload);
      return data.data!;
    } catch (error) {
      handleApiError(error, 'Registration failed');
      throw error;
    }
  },

  async refresh(refreshToken: string) {
    try {
      const { data } = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
      return data.data!;
    } catch (error) {
      // Don't show toast for refresh errors (handled by axios interceptor)
      throw error;
    }
  },

  async logout(refreshToken?: string) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    }
  },

  async forgotPassword(email: string) {
    try {
      const { data } = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to send reset email');
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      const { data } = await apiClient.post<ApiResponse>('/auth/reset-password', { token, password });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to reset password');
      throw error;
    }
  },

  async verifyEmail(token: string) {
    try {
      const { data } = await apiClient.post<ApiResponse>(`/auth/verify-email/${token}`);
      return data;
    } catch (error) {
      handleApiError(error, 'Email verification failed');
      throw error;
    }
  },

  async resendVerification() {
    try {
      const { data } = await apiClient.post<ApiResponse>('/auth/resend-verification');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to resend verification email');
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const { data } = await apiClient.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to change password');
      throw error;
    }
  },

  async getProfile() {
    try {
      const { data } = await apiClient.get<ApiResponse<User>>('/users/profile');
      return data.data!;
    } catch (error) {
      // Don't show toast for profile fetch errors (handled by useAuth hook)
      throw error;
    }
  },

  async updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>) {
    try {
      const { data } = await apiClient.patch<ApiResponse<User>>('/users/profile', payload);
      return data.data!;
    } catch (error) {
      handleApiError(error, 'Failed to update profile');
      throw error;
    }
  },

  async uploadAvatar(formData: FormData) {
    try {
      const { data } = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data!;
    } catch (error) {
      handleApiError(error, 'Failed to upload avatar');
      throw error;
    }
  },

  async googleLogin(idToken: string) {
    try {
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/google', { idToken });
      return data.data!;
    } catch (error) {
      handleApiError(error, 'Google sign-in failed');
      throw error;
    }
  },

  async deleteAccount() {
    try {
      await apiClient.delete('/users/account');
    } catch (error) {
      handleApiError(error, 'Failed to delete account');
      throw error;
    }
  },
};

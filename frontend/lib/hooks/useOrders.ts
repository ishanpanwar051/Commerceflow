import { useQuery, useMutation } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { Order, ApiResponse, PaginatedResponse } from "@/lib/api/types";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await client.get<PaginatedResponse<Order>>("/orders");
      return response.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await client.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await client.post<ApiResponse<Order>>("/orders", payload);
      return response.data.data;
    },
  });
}

export function useCancelOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await client.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
      return response.data.data;
    },
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: async (couponCode: string) => {
      const response = await client.post<ApiResponse<any>>("/orders/apply-coupon", {
        code: couponCode,
      });
      return response.data.data;
    },
  });
}

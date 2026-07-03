import { useQuery, useMutation } from "@tanstack/react-query";
import client from "@/lib/api/client";
import { Product, Category, ApiResponse, PaginatedResponse, Review } from "@/lib/api/types";

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const response = await client.get<PaginatedResponse<Product>>("/products", {
        params: filters,
      });
      return response.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await client.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await client.get<ApiResponse<Category[]>>("/categories");
      return response.data.data;
    },
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const response = await client.get<PaginatedResponse<Product>>("/products/search", {
        params: { q: query },
      });
      return response.data;
    },
    enabled: query.length > 0,
  });
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const response = await client.get<PaginatedResponse<Review>>(`/products/${productId}/reviews`);
      return response.data;
    },
    enabled: !!productId,
  });
}

export function useAddReview() {
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const response = await client.post<ApiResponse<Review>>(
        `/products/${productId}/reviews`,
        data
      );
      return response.data.data;
    },
  });
}

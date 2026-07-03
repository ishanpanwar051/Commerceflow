import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Category } from "@/lib/api/types";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>("/categories");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

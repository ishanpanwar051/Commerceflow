import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import client from "@/lib/api/client";
import { setProfile, updateProfile, addAddress, removeAddress } from "@/lib/slices/userSlice";
import { User, ApiResponse, Address } from "@/lib/api/types";

export function useUserProfile() {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await client.get<ApiResponse<any>>("/users/profile");
      return response.data.data;
    },
  });
}

export function useUpdateProfile() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await client.put<ApiResponse<User>>("/users/profile", data);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(updateProfile(data));
    },
  });
}

export function useAddAddress() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (data: Omit<Address, "id">) => {
      const response = await client.post<ApiResponse<Address>>("/users/addresses", data);
      return response.data.data;
    },
    onSuccess: (data) => {
      dispatch(addAddress(data));
    },
  });
}

export function useUpdateAddress() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Address> }) => {
      const response = await client.put<ApiResponse<Address>>(`/users/addresses/${id}`, data);
      return response.data.data;
    },
  });
}

export function useDeleteAddress() {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/users/addresses/${id}`);
    },
    onSuccess: (_, id) => {
      dispatch(removeAddress(id));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await client.post("/users/change-password", data);
      return response.data;
    },
  });
}

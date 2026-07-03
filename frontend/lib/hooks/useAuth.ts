import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import client from "@/lib/api/client";
import { setUser, setToken, setError, logout } from "@/lib/slices/authSlice";
import { RootState } from "@/lib/store";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: any;
  token: string;
}

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await client.post<AuthResponse>("/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      router.push("/");
    },
    onError: (error: any) => {
      dispatch(setError(error.response?.data?.message || "Login failed"));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await client.post<AuthResponse>("/auth/register", {
        name: payload.name,
        email: payload.email,
        password: payload.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      router.push("/");
    },
    onError: (error: any) => {
      dispatch(setError(error.response?.data?.message || "Registration failed"));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await client.post("/auth/logout");
    },
    onSuccess: () => {
      dispatch(logout());
      router.push("/auth/login");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      await client.post("/auth/forgot-password", { email });
    },
    onError: (error: any) => {
      dispatch(setError(error.response?.data?.message || "Failed to send reset email"));
    },
  });

  return {
    auth,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordLoading: resetPasswordMutation.isPending,
  };
}

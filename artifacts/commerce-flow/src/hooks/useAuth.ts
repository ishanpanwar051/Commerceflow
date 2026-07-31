import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile, logout } from '@/store/slices/userSlice';
import { TokenService } from '@/lib/token.service';

export function useAuth(options: { required?: boolean; redirectTo?: string } = {}) {
  const { required = false, redirectTo = '/auth/login' } = options;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    // If not loading and tokens exist but no user, fetch profile
    if (!isLoading && !user && TokenService.hasTokens()) {
      dispatch(fetchProfile());
    }

    // If auth is required and user is not authenticated after loading, redirect
    if (required && !isLoading && !isAuthenticated && !TokenService.hasTokens()) {
      router.push(redirectTo);
    }
  }, [dispatch, router, user, isAuthenticated, isLoading, required, redirectTo]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/auth/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: handleLogout,
  };
}

export function useRequireAuth() {
  return useAuth({ required: true });
}

export function useOptionalAuth() {
  return useAuth({ required: false });
}

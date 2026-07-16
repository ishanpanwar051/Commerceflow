'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/userSlice';
import { TokenService } from '@/lib/token.service';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const authRoutes = ['/login', '/register'];

export function useAuth(requireAuth = false) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (TokenService.hasTokens() && !isAuthenticated && !isLoading) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }
      if (isAuthenticated && authRoutes.includes(pathname)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, requireAuth, router]);

  return { user, isAuthenticated, isLoading };
}

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { TokenService } from '@/lib/token.service';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string | string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  fallback = <LoadingSpinner />,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!isLoading && requireAuth) {
      const hasTokens = TokenService.hasTokens();
      
      if (!hasTokens) {
        router.push(redirectTo);
        return;
      }

      if (!isAuthenticated && hasTokens) {
        // Tokens exist but user not loaded yet, wait for fetch
        return;
      }

      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requireRole && user) {
        const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
        if (!roles.includes(user.role)) {
          router.push('/unauthorized');
        }
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireRole, user, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requireRole && user) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

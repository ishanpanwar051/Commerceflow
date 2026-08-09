
import { useEffect, ReactNode } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAppSelector } from '@/store/hooks';

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
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (isInitialized) {
      if (requireAuth && !isAuthenticated) {
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
  }, [isAuthenticated, isInitialized, requireAuth, requireRole, user, router, redirectTo]);

  if (!isInitialized) {
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

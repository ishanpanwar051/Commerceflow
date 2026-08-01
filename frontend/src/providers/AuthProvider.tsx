
import { useEffect, ReactNode } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/userSlice';
import { TokenService } from '@/lib/token.service';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // On mount, check if tokens exist and fetch user profile
    const initAuth = async () => {
      if (TokenService.hasTokens()) {
        try {
          await dispatch(fetchProfile()).unwrap();
        } catch (error) {
          // Only clear the session on authentication errors (401).
          // Transient failures (network / 5xx) must not log the user out.
          console.error('Failed to fetch profile on init:', error);
          if ((error as { status?: number })?.status === 401) {
            TokenService.clear();
          }
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}

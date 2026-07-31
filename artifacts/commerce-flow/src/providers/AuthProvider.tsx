
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
          // If profile fetch fails, tokens are invalid
          console.error('Failed to fetch profile on init:', error);
          TokenService.clear();
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}

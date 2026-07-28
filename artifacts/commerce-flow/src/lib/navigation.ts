/**
 * Next.js navigation compatibility shim for wouter.
 * Import these hooks instead of 'next/navigation'.
 */
import { useLocation, useRoute, useParams as useWouterParams } from 'wouter';
import { useCallback } from 'react';

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    prefetch: () => {},
  };
}

export function usePathname() {
  const [pathname] = useLocation();
  return pathname;
}

export function useSearchParams() {
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  return [searchParams] as const;
}

export function useParams() {
  // useWouterParams returns the params from the nearest Route match
  return useWouterParams<Record<string, string>>();
}

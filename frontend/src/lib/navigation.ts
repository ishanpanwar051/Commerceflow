/**
 * Next.js navigation compatibility shim for wouter.
 * Import these hooks instead of 'next/navigation'.
 */
import { useLocation, useRoute, useParams as useWouterParams, useSearchParams as useWouterSearchParams } from 'wouter';
import { useCallback } from 'react';

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    prefetch: () => {},
    refresh: () => {},
  };
}

export function usePathname() {
  const [pathname] = useLocation();
  return pathname;
}

export function useSearchParams() {
  const [searchParams] = useWouterSearchParams();
  return searchParams;
}

export function useParams() {
  // useWouterParams returns the params from the nearest Route match
  return useWouterParams<Record<string, string>>();
}

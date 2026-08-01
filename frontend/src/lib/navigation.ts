/**
 * wouter navigation compatibility shim.
 * Import these hooks instead of 'next/navigation'.
 */
import { useLocation, useParams as useWouterParams, useSearchParams as useWouterSearchParams } from 'wouter';
import { useCallback, useMemo } from 'react';

export function useRouter() {
  const [, navigate] = useLocation();

  const push = useCallback((href: string) => navigate(href), [navigate]);
  const replace = useCallback((href: string) => navigate(href, { replace: true }), [navigate]);
  const back = useCallback(() => window.history.back(), []);
  const forward = useCallback(() => window.history.forward(), []);

  return useMemo(
    () => ({
      push,
      replace,
      back,
      forward,
      prefetch: () => {},
      refresh: () => {},
    }),
    [push, replace, back, forward]
  );
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

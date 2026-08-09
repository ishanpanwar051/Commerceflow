import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Override the fallback shown when the image fails to load. Defaults to /placeholder.svg */
  fallback?: string;
  /** Disable lazy loading (e.g. for the first image above the fold). */
  eager?: boolean;
  /** Max retries for transient load failures (default 2). */
  retryCount?: number;
  /** Delay before each retry in ms (default 1000, grows per attempt). */
  retryDelay?: number;
}

// 1×1 transparent GIF shown while a retry is scheduled so the browser never
// flashes the broken-image icon in the gap between a failed attempt and its
// retry (identical layout, no repaint flicker).
const BLANK_GIF =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

/**
 * Standard product image renderer.
 *
 * Every product-image URL is preserved as-is and rendered through a plain
 * <img>. The renderer is hardened against the one failure mode that leaves
 * otherwise‑valid product images stuck on the gray placeholder:
 *
 * 1. **Transient load failures self-heal** — a failed request is retried (with
 *    a short, growing back-off) instead of permanently swapping the real image
 *    for the placeholder on the very first HTTP-level error. Retries cache-bust
 *    the exact same resource so the browser really does re-request it.
 * 2. **State never leaks between products** — whenever `src` changes (product
 *    swap, React-Query refetch, gallery navigation re-using one instance) all
 *    per-image error/attempt state is reset, so a failure for product A can
 *    never poison product B that uses the same component slot.
 * 3. **onLoad clears stale error state** — a successful load always cancels any
 *    pending retry/fallback.
 * 4. Only after every retry is exhausted does it fall back to the neutral
 *    placeholder (never the browser's broken-image icon).
 *
 * - Lazy-loads and decodes asynchronously by default to keep grids fast.
 * - Uses `object-cover` so every image fills its container with a consistent
 *   aspect ratio and no layout shift.
 */
export function ProductImage({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg',
  eager = false,
  retryCount = 2,
  retryDelay = 1000,
}: ProductImageProps) {
  // Permissive normalization: drop template-literal artifacts and outer
  // whitespace that can slip in behind the scenes, otherwise keep the URL byte
  // for byte intact.
  const cleanSrc = src ? src.replace(/[\{\}]/g, '').trim() : src;

  const [attempt, setAttempt] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const [waitingRetry, setWaitingRetry] = useState(false);
  const timerRef = useRef<number | null>(null);

  // RESET state whenever the intended source changes. Without this, a
  // component re-used for another product (same keyed card position, gallery
  // navigation, or a re-fetched product whose URL was fixed in the DB) keeps
  // the previous product's permanent error/placeholder.
  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setAttempt(0);
    setGaveUp(false);
    setWaitingRetry(false);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [cleanSrc]);

  // Safety: never leave a timer running on unmount.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  // No URL at all → straight to the neutral placeholder (no error machinery).
  if (!cleanSrc) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={`object-cover ${className}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  const scheduleRetry = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setWaitingRetry(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setWaitingRetry(false);
      setAttempt((a) => a + 1);
    }, retryDelay * (attempt + 1));
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (gaveUp || waitingRetry) return; // already resolving
    const srcNow = e.currentTarget.getAttribute('src');
    if (srcNow === fallback) {
      // The fallback itself failed (offline) — never enter an error loop.
      e.currentTarget.onerror = null;
      return;
    }
    if (attempt >= retryCount) {
      setGaveUp(true); // real, lasting fallback
      return;
    }
    scheduleRetry();
  };

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const srcNow = e.currentTarget.getAttribute('src');
    // The blank spacer and the fallback must not be treated as product loads.
    if (srcNow === BLANK_GIF || srcNow === fallback) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setWaitingRetry(false);
    setGaveUp(false);
  };

  // Resolved URL for the current render.
  let displaySrc = cleanSrc;
  if (waitingRetry) {
    displaySrc = BLANK_GIF; // hold cleanly between attempt + retry
  } else if (gaveUp) {
    displaySrc = fallback;
  } else if (attempt > 0) {
    // Retry the SAME image resource with a unique query param so the browser
    // actually issues a new request (it won't re-request an identical src).
    const sep = cleanSrc.includes('?') ? '&' : '?';
    displaySrc = `${cleanSrc}${sep}__productimage_try=${attempt}`;
  }

  return (
    <img
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      className={`object-cover ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

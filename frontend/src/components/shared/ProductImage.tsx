import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Override the fallback shown when the image fails to load. Defaults to /placeholder.svg */
  fallback?: string;
  /** Disable lazy loading (e.g. for the first image above the fold). */
  eager?: boolean;
}

/**
 * Standard product image renderer.
 *
 * - Always falls back to a neutral placeholder on load error (never shows the
 *   browser's broken-image icon).
 * - Lazy-loads and decodes asynchronously by default to keep grids fast.
 * - Uses `object-cover` so every image fills its container with a consistent
 *   aspect ratio and no layout shift.
 */
export function ProductImage({ src, alt, className = '', fallback = '/placeholder.svg', eager = false }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const resolved = src && !errored ? src : fallback;

  return (
    <img
      src={resolved}
      alt={alt}
      className={`object-cover ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={(e) => {
        // Stop retrying the broken URL to avoid an error loop.
        e.currentTarget.onerror = null;
        setErrored(true);
      }}
    />
  );
}

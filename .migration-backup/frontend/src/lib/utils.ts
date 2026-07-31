import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(price) / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName?: string): string {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
}

/**
 * Remove duplicate images (by URL) while preserving order.
 * Ensures a product gallery never shows the same image twice.
 */
export function dedupeImages<T extends { url: string }>(images: T[] | undefined | null): T[] {
  if (!images || images.length === 0) return [];
  const seen = new Set<string>();
  return images.filter((img) => {
    if (!img?.url || seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
}

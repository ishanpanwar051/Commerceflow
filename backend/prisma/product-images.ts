import { SUBCATEGORY_IMAGE_POOLS } from './subcategory-image-pools';
import { USER_CATALOG, findCatalogProduct, findSubcategoryBySlug } from './user-catalog';

type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

const FALLBACK_PHOTO = 'photo-1498049860654-af1a5c566876';

const POOL_KEY_BY_SLUG: Record<string, string> = {
  smartphones: 'smartphones',
  laptops: 'laptops',
  headphones: 'headphones',
  smartwatches: 'smartwatches',
  'men-apparel': 'men-apparel',
  'women-collection': 'women-collection',
  'running-shoes': 'running-shoes',
  'home-decor': 'home-decor',
  cookware: 'cookware',
  'sofas-beds': 'sofas-beds',
  'lighting-lamps': 'lighting-lamps',
  'beauty-skincare': 'beauty-skincare',
  'fitness-gym': 'fitness-gym',
  'toys-games': 'toys-games',
  'pet-supplies': 'pet-supplies',
};

const PARENT_FIRST_SUBCATEGORY: Record<string, string> = {
  electronics: 'smartphones',
  fashion: 'men-apparel',
  'home-living': 'home-decor',
  essentials: 'beauty-skincare',
};

function toUnsplashUrl(photoId: string): string {
  if (!photoId) return '';
  const trimmed = photoId.trim();
  if (trimmed.startsWith('http')) return trimmed;
  const cleanId = trimmed.replace(/[^\w-]/g, '');
  if (!cleanId) return '';
  return `https://images.unsplash.com/${cleanId}?auto=format&fit=crop&w=800&q=80`;
}

export function isBlockedImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    return new URL(url).hostname !== 'images.unsplash.com';
  } catch {
    return true;
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** Resolve the 16-image pool key for a product/subcategory. */
function resolvePoolKey(categorySlug: string, subcategory?: string): string | null {
  const slug = (categorySlug || '').toLowerCase();
  if (POOL_KEY_BY_SLUG[slug]) return POOL_KEY_BY_SLUG[slug];

  const sub = (subcategory || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (POOL_KEY_BY_SLUG[sub]) return POOL_KEY_BY_SLUG[sub];

  const poolSub = findSubcategoryBySlug(subcategory || '') || findSubcategoryBySlug(sub);
  if (poolSub && POOL_KEY_BY_SLUG[poolSub.slug]) return POOL_KEY_BY_SLUG[poolSub.slug];

  for (const [key, pool] of Object.entries(SUBCATEGORY_IMAGE_POOLS)) {
    if (sub.includes(key) || key.includes(sub)) return key;
  }
  return null;
}

/** Single deterministic image for a product. */
export function getProductImages(product: ProductInfo, _productIndex: number = 0): { url: string; alt: string; order: number }[] {
  const name = product.name || '';
  const exact = findCatalogProduct(name);
  if (exact) {
    return [{ url: exact.product.image, alt: name, order: 0 }];
  }

  const poolKey = resolvePoolKey(product.categorySlug, product.subcategory);
  const pool = (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) || [];
  if (pool.length > 0) {
    const url = toUnsplashUrl(pool[simpleHash(name + (product.brand || '')) % pool.length]);
    return [{ url, alt: name, order: 0 }];
  }

  return [{ url: toUnsplashUrl(FALLBACK_PHOTO), alt: name, order: 0 }];
}

/** Category image derived from its own subcategory pool. */
export function getCategoryImage(categorySlug: string): string {
  const slug = (categorySlug || '').toLowerCase();
  const poolKey = POOL_KEY_BY_SLUG[slug] || PARENT_FIRST_SUBCATEGORY[slug];
  const pool = (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) || [];
  if (pool.length > 0) return toUnsplashUrl(pool[0]);
  return toUnsplashUrl(FALLBACK_PHOTO);
}

export { USER_CATALOG, SUBCATEGORY_IMAGE_POOLS };

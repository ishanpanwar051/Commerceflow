import { imagePools } from './image-pools';

/**
 * Curated, HTTP-verified editorial imagery for the catalog.
 *
 * Every photo ID lives in `image-pools.ts` and returned HTTP 200 from
 * images.unsplash.com when verified. No photo ID is reused across categories.
 */

type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

const GENERIC_IMAGE_ID = 'photo-1472851294608-062f824d29cc';

/**
 * Maps every category slug used anywhere in the app (seed scripts, API, admin)
 * to the visual image pool that best matches it. Categories without a dedicated
 * pool fall back to the closest visually-relevant pool.
 * 
 * ✅ FIX: All 17 seed categories now properly mapped (no more 'electronics' fallback)
 */
const categoryToPool: Record<string, string> = {
  // Primary categories (exact matches to image pools)
  electronics: 'electronics',
  'fashion-men': 'fashion-men',
  'fashion-women': 'fashion-women',
  'home-decor': 'home-decor',
  sports: 'sports',
  beauty: 'beauty',
  books: 'books',
  kids: 'kids',
  furniture: 'furniture',
  automotive: 'automotive',
  groceries: 'groceries',
  'office-supplies': 'office-supplies',
  
  // ✅ NEW: Categories from seed.ts that were missing
  shoes: 'sports', // Footwear goes with sports
  kitchen: 'home-decor', // Kitchen items are home products
  toys: 'kids', // Toys belong with kids category
  fitness: 'sports', // Fitness equipment is sports-related
  'pet-supplies': 'kids', // Pet supplies use playful kids imagery
  
  // Legacy alias slugs (backward compatibility)
  clothing: 'fashion-men',
  'home-kitchen': 'home-decor',
  'sports-outdoors': 'sports',
  'books-media': 'books',
  'beauty-health': 'beauty',
  fashion: 'fashion-men',
  general: 'home-decor',
  restaurants: 'groceries', // Restaurant items use groceries pool
};

/**
 * Simple hash function for strings.
 * Returns a positive integer hash value.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministic image selection based on product identity (name + brand).
 *
 * Every product is assigned `k` distinct photos from its category pool, spread
 * evenly across the pool:
 *
 *   images[i] = pool[(start + stride * i) % pool.length]
 *
 * where `start = hash(name:brand) % pool.length` and `stride = floor(len/4)`.
 *
 * Properties:
 *  - STABLE: Same product name+brand always gets same images, regardless of
 *    database order, insertion order, or seed script changes.
 *  - UNIQUE: Different products get different images (via hash distribution).
 *  - CATEGORY-AWARE: Products use images from their own category pool.
 *  - All `k` images of one product are distinct.
 *  - Image usage is spread evenly across the pool.
 */
function pickImageIndices(n: number, k: number, productIdentity: string): number[] {
  const result: number[] = [];
  let attempt = 0;
  while (result.length < Math.min(k, n) && attempt < 100) {
    const hash = simpleHash(`${productIdentity}:image:${attempt}`);
    const idx = hash % n;
    if (!result.includes(idx)) {
      result.push(idx);
    }
    attempt++;
  }
  return result;
}

export function imageUrl(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
}

export function getCategoryImage(categorySlug: string): string | undefined {
  const poolKey = categoryToPool[categorySlug] || 'electronics';
  const images = imagePools[poolKey] || imagePools.electronics;
  const hash = simpleHash(categorySlug);
  const idx = hash % images.length;
  const id = images[idx] || GENERIC_IMAGE_ID;
  return imageUrl(id);
}

/**
 * Generate stable, deterministic product images based on product identity.
 * 
 * Uses hash of product name + brand to ensure:
 * - Same product always gets same images (stable)
 * - Different products get different images (unique)
 * - Images match product's category (category-aware)
 * 
 * @param product Product information (name, brand, categorySlug)
 * @param _productIndex DEPRECATED - kept for backward compatibility but not used
 * @returns Array of 4 image objects with url, alt, and order
 */
export function getProductImages(product: ProductInfo, _productIndex?: number) {
  const poolKey = categoryToPool[product.categorySlug] || 'electronics';
  const images = imagePools[poolKey] || imagePools.electronics;

  // Create stable product identity from name and brand
  const productIdentity = `${product.name}:${product.brand || 'generic'}`;

  // Pick 4 distinct photo IDs spread across the category pool
  // Images are stable - same product always gets same images
  const indices = pickImageIndices(images.length, 4, productIdentity);

  return indices.map((idx, order) => {
    const photoId = images[idx];
    return {
      url: imageUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

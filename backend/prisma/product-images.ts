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
 * pool fall back to the closest visually-relevant pool instead of defaulting to
 * electronics images.
 */
const categoryToPool: Record<string, string> = {
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
  restaurants: 'restaurants',
  // Alias slugs used by seed-products.ts (kept in sync with its categories)
  clothing: 'fashion-men',
  'home-kitchen': 'home-decor',
  'sports-outdoors': 'sports',
  'books-media': 'books',
  'beauty-health': 'beauty',
  // Subcategory/leaf slugs that fall under a top-level pool
  shoes: 'fashion-men',
  kitchen: 'home-decor',
  toys: 'kids',
  fitness: 'sports',
  'pet-supplies': 'home-decor',
  fashion: 'fashion-men',
  general: 'home-decor',
};

/**
 * Deterministic image selection.
 *
 * Every product is assigned `k` distinct photos from its category pool, spread
 * evenly across the pool:
 *
 *   images[i] = pool[(start + stride * i) % pool.length]
 *
 * where `start = productIndex % pool.length` and `stride = floor(len/4)`.
 *
 * Properties:
 *  - The PRIMARY image (i = 0) is `pool[productIndex % len]`, so it is unique
 *    for the first `len` products in a category — every product in the current
 *    catalog gets its own primary image.
 *  - All `k` images of one product are distinct.
 *  - Image usage is spread evenly across the pool instead of clustering on a
 *    few URLs (the naive factorial permutation degenerated to pool[0..2] for
 *    every small index).
 */
function pickImageIndices(n: number, k: number, productIndex: number): number[] {
  const take = Math.min(k, n);
  const stride = Math.max(1, Math.floor(n / 4));
  const start = ((productIndex % n) + n) % n;
  const result: number[] = [];
  for (let j = 0; j < take; j += 1) {
    result.push((start + stride * j) % n);
  }
  return result;
}

export function imageUrl(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
}

export function getCategoryImage(categorySlug: string): string | undefined {
  const poolKey = categoryToPool[categorySlug] || 'electronics';
  const images = imagePools[poolKey] || imagePools.electronics;
  const id = images[0] || GENERIC_IMAGE_ID;
  return imageUrl(id);
}

export function getProductImages(product: ProductInfo, productIndex: number) {
  const poolKey = categoryToPool[product.categorySlug] || 'electronics';
  const images = imagePools[poolKey] || imagePools.electronics;

  // Pick 4 distinct photo IDs spread across the category pool so the primary
  // image is unique per product and gallery images are evenly distributed.
  const indices = pickImageIndices(images.length, 4, productIndex);

  return indices.map((idx, order) => {
    const photoId = images[idx];
    return {
      url: imageUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

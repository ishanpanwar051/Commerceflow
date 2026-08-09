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

/** Resolve the image pool key for a product based on its name, category, and subcategory. */
function resolvePoolKey(categorySlug: string, subcategory?: string, productName?: string): string | null {
  const cat = (categorySlug || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const name = (productName || '').toLowerCase();

  // Product names are the strongest signal. This pass intentionally runs before
  // category matching because legacy databases contain broad or incorrect category
  // slugs; an earbud must never receive a fashion or home image because of that.
  if (name.includes('headphone') || name.includes('earphone') || name.includes('earbud') || name.includes('buds') || name.includes('headset') || name.includes('airpods') || name.includes('wh-') || name.includes('wf-') || name.includes('tour pro') || name.includes('jbl') || name.includes('sony linkbuds') || name.includes('quietcomfort') || name.includes('momentum') || name.includes('soundcore') || name.includes('crusher') || name.includes('tune') || name.includes('quantum') || name.includes('ath-') || name.includes('beats') || name.includes('marshall') || name.includes('mdr-')) return 'headphones';
  if (name.includes('watch') || name.includes('fitbit') || name.includes('garmin') || name.includes('amazfit') || name.includes('storm') || name.includes('colorfit') || name.includes('venu') || name.includes('fenix')) return 'smartwatches';
  if (name.includes('phone') || name.includes('iphone') || name.includes('galaxy s') || name.includes('pixel') || name.includes('oneplus') || name.includes('xiaomi') || name.includes('nothing phone') || name.includes('realme') || name.includes('vivo') || name.includes('oppo') || name.includes('motorola') || name.includes('honor')) return 'smartphones';
  if (name.includes('deathadder') || name.includes('viper v3') || name.includes('g502') || name.includes('mx master') || name.includes('computer mouse') || name.includes('wireless mouse')) return 'laptops';
  if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook') || name.includes('thinkpad') || name.includes('zenbook') || name.includes('surface laptop') || name.includes('book4') || name.includes('inspiron') || name.includes('pavilion') || name.includes('ideapad') || name.includes('xps') || name.includes('spectre') || name.includes('zephyrus') || name.includes('swift')) return 'laptops';
  if (name.includes('shoe') || name.includes('sneaker') || name.includes('sandal') || name.includes('slipper') || name.includes('boot') || name.includes('flop') || name.includes('heel') || name.includes('loafer') || name.includes('flat')) return 'running-shoes';

  // --- Phase 1: Category-aware keyword matching ---
  // Only match product-type keywords that make sense for the product's actual parent category.

  // ELECTRONICS category products
  if (cat === 'electronics' || cat.includes('electronic')) {
    if (name.includes('phone') || name.includes('mobile') || name.includes('iphone') || name.includes('galaxy s') || name.includes('pixel') || name.includes('oneplus') || name.includes('xiaomi') || name.includes('nothing phone') || name.includes('realme') || name.includes('vivo') || name.includes('oppo') || name.includes('motorola') || name.includes('honor')) return 'smartphones';
    if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook') || name.includes('thinkpad') || name.includes('zenbook') || name.includes('surface laptop') || name.includes('book4') || name.includes('inspiron') || name.includes('pavilion') || name.includes('ideapad') || name.includes('xps') || name.includes('spectre') || name.includes('zephyrus') || name.includes('swift')) return 'laptops';
    if (name.includes('headphone') || name.includes('earphone') || name.includes('buds') || name.includes('headset') || name.includes('airpods') || name.includes('wh-1000') || name.includes('quietcomfort') || name.includes('momentum') || name.includes('soundcore') || name.includes('crusher') || name.includes('tune') || name.includes('quantum') || name.includes('ath-') || name.includes('beats') || name.includes('marshall') || name.includes('mdr-')) return 'headphones';
    if (name.includes('watch') || name.includes('fitbit') || name.includes('garmin') || name.includes('amazfit') || name.includes('boat storm') || name.includes('colorfit')) return 'smartwatches';
    // Default electronics to laptops (covers routers, SSDs, chargers, etc.)
    return 'laptops';
  }

  // FASHION-MEN category products
  if (cat === 'fashion-men' || (cat.includes('fashion') && cat.includes('men') && !cat.includes('women'))) {
    return 'men-apparel';
  }

  // FASHION-WOMEN category products
  if (cat === 'fashion-women' || (cat.includes('fashion') && cat.includes('women'))) {
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('sandal') || name.includes('slipper') || name.includes('boot') || name.includes('flop') || name.includes('heel') || name.includes('loafer') || name.includes('flat')) return 'running-shoes';
    return 'women-collection';
  }

  // SHOES-FOOTWEAR category products
  if (cat === 'shoes-footwear' || cat.includes('shoe') || cat.includes('footwear')) {
    return 'running-shoes';
  }

  // HOME-KITCHEN-FURNITURE category products
  if (cat === 'home-kitchen-furniture' || cat.includes('home') || cat.includes('kitchen') || cat.includes('furniture')) {
    if (name.includes('lamp') || name.includes('light') || name.includes('bulb') || name.includes('chandelier') || name.includes('sconce') || name.includes('neon') || name.includes('edison')) return 'lighting-lamps';
    if (name.includes('pan') || name.includes('pot') || name.includes('cooker') || name.includes('cookware') || name.includes('knife') || name.includes('kadhai') || name.includes('wok') || name.includes('kettle') || name.includes('frying') || name.includes('skillet') || name.includes('coffee maker') || name.includes('press')) return 'cookware';
    if (name.includes('sofa') || name.includes('bed') || name.includes('chair') || name.includes('couch') || name.includes('table') || name.includes('recliner') || name.includes('mattress') || name.includes('wardrobe') || name.includes('bookshelf') || name.includes('shelf') || name.includes('desk')) return 'sofas-beds';
    if (name.includes('rug') || name.includes('curtain') || name.includes('cushion') || name.includes('pillow') || name.includes('vase') || name.includes('candle') || name.includes('mirror') || name.includes('decor') || name.includes('art') || name.includes('frame') || name.includes('canvas') || name.includes('bonsai') || name.includes('clock') || name.includes('blanket')) return 'home-decor';
    // Default home to home-decor
    return 'home-decor';
  }

  // OFFICE-TOYS-GROCERIES-AUTOMOTIVE category products
  if (cat === 'office-toys-groceries-automotive' || cat.includes('office') || cat.includes('toys') || cat.includes('automotive') || cat.includes('groceries')) {
    if (name.includes('pet') || name.includes('dog') || name.includes('cat food') || name.includes('leash') || name.includes('litter')) return 'pet-supplies';
    return 'toys-games';
  }

  // SPORTS-FITNESS-BEAUTY category products
  if (cat === 'sports-fitness-beauty' || cat.includes('sports') || cat.includes('fitness') || cat.includes('beauty')) {
    if (name.includes('serum') || name.includes('lipstick') || name.includes('shampoo') || name.includes('sunscreen') || name.includes('perfume') || name.includes('parfum') || name.includes('toner') || name.includes('lotion') || name.includes('cream') || name.includes('foundation') || name.includes('eyeliner') || name.includes('makeup') || name.includes('conditioner') || name.includes('skincare') || name.includes('face wash') || name.includes('beauty') || name.includes('hair dryer') || name.includes('body lotion') || name.includes('face mask')) return 'beauty-skincare';
    return 'fitness-gym';
  }

  // --- Phase 2: Exact slug matching ---
  if (POOL_KEY_BY_SLUG[cat]) return POOL_KEY_BY_SLUG[cat];

  const subSlug = sub
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (POOL_KEY_BY_SLUG[subSlug]) return POOL_KEY_BY_SLUG[subSlug];

  const poolSub = findSubcategoryBySlug(subcategory || '') || findSubcategoryBySlug(subSlug);
  if (poolSub && POOL_KEY_BY_SLUG[poolSub.slug]) return POOL_KEY_BY_SLUG[poolSub.slug];

  // --- Phase 3: Last resort fallback ---
  for (const [key] of Object.entries(SUBCATEGORY_IMAGE_POOLS)) {
    if (subSlug.includes(key) || key.includes(subSlug)) return key;
  }
  return null;
}

const usedUrls = new Set<string>();

export function resetUsedImages(products?: { name: string }[]) {
  usedUrls.clear();
  if (products) {
    for (const p of products) {
      const exact = findCatalogProduct(p.name);
      if (exact && exact.product.image) {
        usedUrls.add(exact.product.image);
      }
    }
  }
}

const RELATED_POOLS: Record<string, string[]> = {
  electronics: ['smartphones', 'laptops', 'headphones', 'smartwatches'],
  'fashion-men': ['men-apparel', 'running-shoes', 'women-collection'],
  'fashion-women': ['women-collection', 'running-shoes', 'men-apparel'],
  'home-kitchen-furniture': ['home-decor', 'cookware', 'sofas-beds', 'lighting-lamps'],
  'office-toys-groceries-automotive': ['toys-games', 'pet-supplies', 'home-decor'],
  'shoes-footwear': ['running-shoes', 'men-apparel', 'women-collection'],
  'sports-fitness-beauty': ['fitness-gym', 'beauty-skincare', 'pet-supplies'],
};

/** Single deterministic and unique image for a product. */
export function getProductImages(product: ProductInfo, _productIndex: number = 0): { url: string; alt: string; order: number }[] {
  const name = product.name || '';
  const normalizedName = name.toLowerCase();

  // Legacy catalogs contain several mouse products without a dedicated pool.
  // Keep them on a real computer-mouse image instead of a random category photo.
  if (normalizedName.includes('deathadder') || normalizedName.includes('viper v3') || normalizedName.includes('g502') || normalizedName.includes('mx master') || normalizedName.includes('computer mouse') || normalizedName.includes('wireless mouse')) {
    return [{ url: toUnsplashUrl('photo-1527814050087-3793815479db'), alt: name, order: 0 }];
  }

  // 1. Exact catalog product match (has unique images in catalog by default)
  const exact = findCatalogProduct(name);
  if (exact) {
    return [{ url: exact.product.image, alt: name, order: 0 }];
  }

  const hash = simpleHash(name + (product.brand || ''));
  const poolKey = resolvePoolKey(product.categorySlug, product.subcategory, name);

  // 2. Try to find an unused image in the preferred pool
  if (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) {
    const pool = SUBCATEGORY_IMAGE_POOLS[poolKey];
    for (let offset = 0; offset < pool.length; offset++) {
      const imgId = pool[(hash + offset) % pool.length];
      const url = toUnsplashUrl(imgId);
      if (!usedUrls.has(url)) {
        usedUrls.add(url);
        return [{ url, alt: name, order: 0 }];
      }
    }
  }

  // 3. Try to find an unused image in related pools
  const normCat = (product.categorySlug || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const related = RELATED_POOLS[normCat] || [];
  for (const relKey of related) {
    if (relKey === poolKey) continue;
    const pool = SUBCATEGORY_IMAGE_POOLS[relKey] || [];
    for (let offset = 0; offset < pool.length; offset++) {
      const imgId = pool[(hash + offset) % pool.length];
      const url = toUnsplashUrl(imgId);
      if (!usedUrls.has(url)) {
        usedUrls.add(url);
        return [{ url, alt: name, order: 0 }];
      }
    }
  }

  // 4. Try to find an unused image in ANY pool
  for (const [key, pool] of Object.entries(SUBCATEGORY_IMAGE_POOLS)) {
    for (const imgId of pool) {
      const url = toUnsplashUrl(imgId);
      if (!usedUrls.has(url)) {
        usedUrls.add(url);
        return [{ url, alt: name, order: 0 }];
      }
    }
  }

  // 5. Hard fallback (if all 240 unique images are used, which is impossible for 100 products)
  const pool = (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) || SUBCATEGORY_IMAGE_POOLS['smartphones'];
  const url = toUnsplashUrl(pool[hash % pool.length]);
  return [{ url, alt: name, order: 0 }];
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

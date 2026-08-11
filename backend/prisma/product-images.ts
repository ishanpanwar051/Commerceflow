import { SUBCATEGORY_IMAGE_POOLS } from './subcategory-image-pools';
import { USER_CATALOG, findCatalogProduct, findSubcategoryBySlug } from './user-catalog';

type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

const FALLBACK_PHOTO = 'photo-1498049860654-af1a5c566876';

// Custom images supplied by the site owner (keyed by lowercase product name).
// These take priority over every placeholder source so they never get reset.
export const CUSTOM_PRODUCT_IMAGES: Record<string, string> = {
  // Trial Section: 16 Smartphones mapped to Pinterest image URLs
  'iphone 17 pro max': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  'iphone 17 pro': 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
  'iphone 16e': 'https://i.pinimg.com/736x/90/c0/f8/90c0f82b8f61c346a172a424d4d0b10a.jpg',
  'samsung galaxy s26 ultra': 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg',
  'samsung galaxy s26+': 'https://i.pinimg.com/736x/d5/64/26/d56426cc8ad6a77dbb03e7e9ed5ffda3.jpg',
  'samsung galaxy z fold 7': 'https://i.pinimg.com/736x/f8/6a/bc/f86abced150f6dcdbe0468e16296810b.jpg',
  'google pixel 10 pro xl': 'https://i.pinimg.com/736x/24/85/69/248569e562fc906baf54dbf9a9251112.jpg',
  'google pixel 10 pro': 'https://i.pinimg.com/1200x/f2/cf/35/f2cf35e863abad46bea5d3e1eb483404.jpg',
  'oneplus 13': 'https://i.pinimg.com/1200x/ab/03/1d/ab031db73e8ee1bf1c566f4b58fa0fcf.jpg',
  'xiaomi 16 pro': 'https://i.pinimg.com/1200x/24/9c/14/249c14f8278394ba6b7070b66892fc51.jpg',
  'nothing phone 3': 'https://i.pinimg.com/736x/01/8f/8a/018f8adb63275f1ed917e7082373978e.jpg',
  'realme gt 7 pro': 'https://i.pinimg.com/736x/56/75/81/5675819358843349723552ca.jpg',
  'vivo x200 pro': 'https://i.pinimg.com/736x/05/43/e0/0543e09d6fa1150b7b243004d28c989e.jpg',
  'oppo find n5': 'https://i.pinimg.com/1200x/20/d3/ce/20d3cebe1bb19b1b94800fdf5d650a90.jpg',
  'motorola edge 60 pro': 'https://i.pinimg.com/736x/2a/f4/3b/2af43baa9704d567dd1aafecc447c58d.jpg',
  'honor magic 7 pro': 'https://i.pinimg.com/736x/7d/d2/15/7dd21547d9a806eb7405ae816879cd4a.jpg',
  'macbook pro 16': 'https://i.pinimg.com/736x/4f/17/de/4f17de878b3d044bcfd41b12e3de6257.jpg',
};

function findCustomImage(name: string): string | null {
  const lower = (name || '').toLowerCase();
  for (const [key, url] of Object.entries(CUSTOM_PRODUCT_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

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

function resolveImageUrl(value: string): string {
  if (!value) return '/placeholder.svg';
  const trimmed = value.trim();
  if (trimmed.startsWith('http')) return trimmed;
  return '/placeholder.svg';
}

export function isBlockedImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes('picsum.photos');
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
  
  // 0. Site-owner supplied image (never overwritten by pool placeholders)
  const custom = findCustomImage(name);
  if (custom) {
    return [{ url: custom, alt: name, order: 0 }];
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
      const url = resolveImageUrl(imgId);
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
      const url = resolveImageUrl(imgId);
      if (!usedUrls.has(url)) {
        usedUrls.add(url);
        return [{ url, alt: name, order: 0 }];
      }
    }
  }

  // 4. Try to find an unused image in ANY pool
  for (const [key, pool] of Object.entries(SUBCATEGORY_IMAGE_POOLS)) {
    for (const imgId of pool) {
      const url = resolveImageUrl(imgId);
      if (!usedUrls.has(url)) {
        usedUrls.add(url);
        return [{ url, alt: name, order: 0 }];
      }
    }
  }

  // 5. Hard fallback (if all 240 unique images are used, which is impossible for 100 products)
  const pool = (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) || SUBCATEGORY_IMAGE_POOLS['smartphones'];
  const url = resolveImageUrl(pool[hash % pool.length]);
  return [{ url, alt: name, order: 0 }];
}

/** Category image derived from its own subcategory pool. */
export function getCategoryImage(categorySlug: string): string {
  const slug = (categorySlug || '').toLowerCase();
  const poolKey = POOL_KEY_BY_SLUG[slug] || PARENT_FIRST_SUBCATEGORY[slug];
  const pool = (poolKey && SUBCATEGORY_IMAGE_POOLS[poolKey]) || [];
  if (pool.length > 0) return resolveImageUrl(pool[0]);
  return resolveImageUrl(FALLBACK_PHOTO);
}

export { USER_CATALOG, SUBCATEGORY_IMAGE_POOLS };

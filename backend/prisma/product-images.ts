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
/** Resolve the 16-image pool key for a product/subcategory/name. */
function resolvePoolKey(categorySlug: string, subcategory?: string, productName?: string): string | null {
  const cat = (categorySlug || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const name = (productName || '').toLowerCase();

  // 1. Specific product name keyword overrides (highest priority)
  if (name.includes('phone') || name.includes('mobile') || name.includes('iphone') || name.includes('samsung galaxy s') || name.includes('pixel')) return 'smartphones';
  if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook') || name.includes('thinkpad') || name.includes('zenbook') || name.includes('surface laptop') || name.includes('book4')) return 'laptops';
  if (name.includes('headphone') || name.includes('earphone') || name.includes('buds') || name.includes('audio') || name.includes('headset') || name.includes('speaker') || name.includes('soundbar') || name.includes('earbuds') || name.includes('airpods') || name.includes('soundcore') || name.includes('momentum') || name.includes('quietcomfort')) return 'headphones';
  if (name.includes('watch') || name.includes('smartwatch') || name.includes('fitbit') || name.includes('garmin') || name.includes('boat storm') || name.includes('colorfit')) return 'smartwatches';
  
  if (name.includes('shoe') || name.includes('sneaker') || name.includes('sandal') || name.includes('slippers') || name.includes('boots') || name.includes('flops') || name.includes('footwear') || name.includes('pegasus') || name.includes('ultraboost') || name.includes('clifton')) return 'running-shoes';
  
  if (name.includes('sofa') || name.includes('bed') || name.includes('chair') || name.includes('couch') || name.includes('table') || name.includes('recliner') || name.includes('mattress') || name.includes('wardrobe') || name.includes('sectional') || name.includes('loveseat') || name.includes('sleeper')) return 'sofas-beds';
  if (name.includes('lamp') || name.includes('light') || name.includes('bulb') || name.includes('chandelier') || name.includes('sconce') || name.includes('led') || name.includes('neon') || name.includes('edison')) return 'lighting-lamps';
  if (name.includes('pan') || name.includes('pot') || name.includes('cooker') || name.includes('cookware') || name.includes('knife') || name.includes('kadhai') || name.includes('wok') || name.includes('kettle') || name.includes('frying') || name.includes('skillet')) return 'cookware';
  if (name.includes('decor') || name.includes('vase') || name.includes('clock') || name.includes('rug') || name.includes('mirror') || name.includes('candle') || name.includes('curtain') || name.includes('pillow') || name.includes('cushion') || name.includes('art') || name.includes('frame') || name.includes('canvas') || name.includes('bonsai')) return 'home-decor';
  
  if (name.includes('beauty') || name.includes('skincare') || name.includes('serum') || name.includes('lipstick') || name.includes('shampoo') || name.includes('sunscreen') || name.includes('perfume') || name.includes('toner') || name.includes('lotion') || name.includes('cream') || name.includes('facewash') || name.includes('eyeliner') || name.includes('makeup') || name.includes('conditioner') || name.includes('shea butter')) return 'beauty-skincare';
  if (name.includes('fitness') || name.includes('gym') || name.includes('dumbbells') || name.includes('yoga') || name.includes('protein') || name.includes('cricket') || name.includes('football') || name.includes('shaker') || name.includes('kettlebell') || name.includes('bench') || name.includes('roller') || name.includes('bench') || name.includes('bat') || name.includes('mat')) return 'fitness-gym';
  if (name.includes('toy') || name.includes('game') || name.includes('puzzle') || name.includes('drone') || name.includes('chess') || name.includes('monopoly') || name.includes('lego') || name.includes('blocks') || name.includes('car') || name.includes('motorcycle') || name.includes('helmet') || name.includes('washer') || name.includes('oil') || name.includes('jigsaw') || name.includes('playstation') || name.includes('xbox') || name.includes('nintendo') || name.includes('deck') || name.includes('teddy') || name.includes('blaster') || name.includes('doll') || name.includes('rubik') || name.includes('harness') || name.includes('carrier')) return 'toys-games';
  if (name.includes('pet') || name.includes('dog') || name.includes('cat') || name.includes('leash') || name.includes('litter') || name.includes('grooming') || name.includes('bird') || name.includes('fish') || name.includes('food') || name.includes('chew') || name.includes('collar') || name.includes('carrier') || name.includes('harness') || name.includes('shampoo')) return 'pet-supplies';

  // 2. Exact match using default maps
  if (POOL_KEY_BY_SLUG[cat]) return POOL_KEY_BY_SLUG[cat];

  const subSlug = sub
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (POOL_KEY_BY_SLUG[subSlug]) return POOL_KEY_BY_SLUG[subSlug];

  const poolSub = findSubcategoryBySlug(subcategory || '') || findSubcategoryBySlug(subSlug);
  if (poolSub && POOL_KEY_BY_SLUG[poolSub.slug]) return POOL_KEY_BY_SLUG[poolSub.slug];

  // 3. Category/Subcategory keyword matching
  if (cat.includes('phone') || sub.includes('phone')) return 'smartphones';
  if (cat.includes('laptop') || sub.includes('laptop')) return 'laptops';
  if (cat.includes('headphone') || sub.includes('headphone')) return 'headphones';
  if (cat.includes('watch') || sub.includes('watch')) return 'smartwatches';
  
  if (cat.includes('shoe') || sub.includes('shoe') || cat.includes('footwear') || sub.includes('footwear')) return 'running-shoes';
  
  if (cat.includes('women') || sub.includes('women')) return 'women-collection';
  if (cat.includes('men') || sub.includes('men')) return 'men-apparel';
  
  if (cat.includes('decor') || sub.includes('decor')) return 'home-decor';
  if (cat.includes('cookware') || sub.includes('cookware') || cat.includes('kitchen') || sub.includes('kitchen')) return 'cookware';
  if (cat.includes('sofa') || sub.includes('sofa') || cat.includes('furniture') || sub.includes('furniture')) return 'sofas-beds';
  if (cat.includes('lighting') || sub.includes('lighting')) return 'lighting-lamps';
  
  if (cat.includes('beauty') || sub.includes('beauty') || cat.includes('skincare') || sub.includes('skincare')) return 'beauty-skincare';
  if (cat.includes('fitness') || sub.includes('fitness') || cat.includes('gym') || sub.includes('gym') || cat.includes('sports') || sub.includes('sports')) return 'fitness-gym';
  if (cat.includes('toy') || sub.includes('toy') || cat.includes('game') || sub.includes('game') || cat.includes('automotive') || sub.includes('automotive')) return 'toys-games';
  if (cat.includes('pet') || sub.includes('pet')) return 'pet-supplies';

  // 4. Fallback based on parent category slug
  if (cat === 'electronics') return 'laptops';
  if (cat.includes('fashion-men')) return 'men-apparel';
  if (cat.includes('fashion-women')) return 'women-collection';
  if (cat.includes('home-kitchen-furniture') || cat.includes('home') || cat.includes('kitchen') || cat.includes('furniture')) return 'home-decor';
  if (cat.includes('office-toys-groceries-automotive') || cat.includes('automotive') || cat.includes('toys') || cat.includes('office')) return 'toys-games';
  if (cat.includes('shoes-footwear')) return 'running-shoes';
  if (cat.includes('sports-fitness-beauty') || cat.includes('sports') || cat.includes('fitness')) return 'fitness-gym';

  // Loop through entries as a final resort
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
  console.log('RESET USED IMAGES: preloaded', usedUrls.size, 'active catalog image URLs');
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

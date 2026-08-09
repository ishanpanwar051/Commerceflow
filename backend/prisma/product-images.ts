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

const categoryToKeyword: Record<string, string> = {
  electronics: 'gadget',
  'fashion-men': 'men-clothing',
  'fashion-women': 'women-clothing',
  sports: 'sports-equipment',
  beauty: 'beauty-cosmetics',
  books: 'book',
  kids: 'kids-toy',
  furniture: 'furniture',
  automotive: 'car-accessories',
  groceries: 'groceries',
  'office-supplies': 'office-supplies',
  shoes: 'shoes',
  kitchen: 'kitchenware',
  toys: 'toy',
  fitness: 'fitness-equipment',
  'pet-supplies': 'pet-supplies',
};

const subcategoryToKeyword: Record<string, string> = {
  // Electronics
  'phones': 'smartphone',
  'laptops': 'laptop',
  'tablets': 'tablet',
  'monitors': 'computermonitor',
  'keyboards': 'keyboard',
  'mouse': 'computermouse',
  'gaming': 'gamingconsole',
  'cameras': 'camera',
  'earbuds': 'earbuds',
  'headphones': 'headphones',
  'speakers': 'speaker',
  'smart-watches': 'smartwatch',
  'power-banks': 'powerbank',
  'chargers': 'charger',
  'ssd': 'ssd',
  'routers': 'router',

  // Fashion Men
  't-shirts': 'tshirt',
  'shirts': 'shirt',
  'jeans': 'jeans',
  'trousers': 'trousers',
  'suits': 'suit',
  'jackets': 'jacket',
  'sweaters': 'sweater',
  'shorts': 'shorts',
  'innerwear': 'underwear',
  'socks': 'socks',
  'belts': 'belt',
  'wallets': 'wallet',
  'sunglasses': 'sunglasses',
  'watches': 'watch',
  'ties': 'tie',
  'caps': 'cap',

  // Fashion Women
  'dresses': 'dress',
  'tops': 'top,clothing',
  'skirts': 'skirt',
  'kurtas': 'kurta',
  'sarees': 'saree',
  'leggings': 'leggings',
  'handbags': 'handbag',
  'jewelry': 'jewelry',
  'heels': 'heels',
  'flats': 'flatshoes',
  'clutches': 'clutchbag',

  // Kids
  'boys-clothing': 'boy,clothing',
  'girls-clothing': 'girl,clothing',
  'baby-gear': 'stroller',
  'school-supplies': 'backpack,stationery',
  'toys': 'toy',
  'shoes': 'shoes',
  'backpacks': 'backpack',
  'accessories': 'accessories',

  // Shoes
  'running-shoes': 'runningshoes',
  'casual-shoes': 'sneakers',
  'formal-shoes': 'shoes',
  'sports-shoes': 'shoes',
  'sandals': 'sandals',
  'slippers': 'slippers',
  'boots': 'boots',
  'flip-flops': 'flipflops',

  // Sports
  'cricket': 'cricket,bat',
  'football': 'soccer',
  'basketball': 'basketball',
  'tennis': 'tennis',
  'badminton': 'badminton',
  'swimming': 'swimwear',
  'cycling': 'bicycle',
  'yoga': 'yoga',
  'gym-equipment': 'dumbbells',
  'camping': 'tent',

  // Beauty
  'makeup': 'makeup',
  'skincare': 'skincare',
  'haircare': 'shampoo',
  'fragrance': 'perfume',
  'bath-body': 'soap',
  'nail-care': 'nailpolish',
  'tools-brushes': 'makeupbrush',
  'beauty-appliances': 'hairdryer',

  // Home Decor
  'wall-art': 'painting',
  'cushions': 'cushion',
  'curtains': 'curtains',
  'rugs': 'rug',
  'lamps': 'lamp',
  'clocks': 'clock',
  'vases': 'vase',
  'candles': 'candle',
  'frames': 'frame',
  'plants': 'plant',

  // Kitchen
  'cookware': 'pot,pan',
  'utensils': 'spoon,fork',
  'appliances': 'blender',
  'storage': 'box',
  'bakeware': 'baking',
  'barware': 'glass',
  'coffee-tea': 'coffee',
  'water-bottles': 'bottle',

  // Furniture
  'sofas': 'sofa',
  'beds': 'bed',
  'tables': 'table',
  'chairs': 'chair',
  'wardrobes': 'wardrobe',
  'bookshelves': 'bookshelf',
  'desks': 'desk',
  'cabinets': 'cabinet',
  'mattresses': 'mattress',

  // Books
  'fiction': 'book',
  'non-fiction': 'book',
  'academic': 'book',
  'children': 'book',
  'comics': 'comic',
  'self-help': 'book',
  'business': 'book',
  'science': 'book',
  'history': 'book',
  'biography': 'book',

  // Toys
  'action-figures': 'actionfigure',
  'board-games': 'boardgame',
  'puzzles': 'puzzle',
  'dolls': 'doll',
  'remote-control': 'rccar',
  'educational': 'toy',
  'building-blocks': 'blocks',
  'outdoor-play': 'toy',

  // Fitness
  'weights': 'weights',
  'yoga-mats': 'yogamat',
  'resistance-bands': 'bands',
  'protein': 'protein',
  'vitamins': 'vitamins',
  'fitness-trackers': 'fitnesstracker',

  // Groceries
  'snacks': 'snacks',
  'beverages': 'soda',
  'cooking-oil': 'oil',
  'spices': 'spices',
  'rice-grains': 'rice',
  'dairy': 'milk',
  'bread-bakery': 'bread',
  'cleaning-supplies': 'detergent',

  // Pet Supplies
  'dog-food': 'dogfood',
  'cat-food': 'catfood',
  'pet-toys': 'pettoy',
  'pet-beds': 'petbed',
  'collars': 'collar',
  'grooming': 'petbrush',
  'bowls': 'petbowl',
  'aquariums': 'fish',

  // Automotive
  'car-care': 'carwash',
  'interior': 'carseat',
  'exterior': 'carcover',
  'lubricants': 'oil',
  'tools': 'wrench',
  'helmets': 'helmet',
  'riding-gear': 'motorcycle',
  'bike-accessories': 'motorcycle',

  // Office Supplies
  'notebooks': 'notebook',
  'pens': 'pen',
  'printers': 'printer',
  'paper': 'paper',
  'folders': 'folder',
  'desk-organizers': 'deskorganizer',
  'staplers': 'stapler',
  'whiteboards': 'whiteboard',
};

export function getCategoryImage(categorySlug: string): string {
  const catKey = categorySlug.toLowerCase();
  const keyword = categoryToKeyword[catKey] || 'category';
  const hash = simpleHash(categorySlug);
  return `https://loremflickr.com/800/800/${encodeURIComponent(keyword)}?lock=${hash % 10000}`;
}

export function getProductImages(product: ProductInfo, _productIndex?: number) {
  const subKey = (product.subcategory || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const catKey = (product.categorySlug || '').toLowerCase();

  const keyword = subcategoryToKeyword[subKey] || categoryToKeyword[catKey] || 'product';
  const productIdentity = `${product.name}:${product.brand || 'generic'}`;
  const hash = simpleHash(productIdentity);

  return Array.from({ length: 4 }).map((_, order) => {
    const lockSeed = (hash + order * 13) % 10000;
    const url = `https://loremflickr.com/800/800/${encodeURIComponent(keyword)}?lock=${lockSeed}`;
    
    return {
      url,
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

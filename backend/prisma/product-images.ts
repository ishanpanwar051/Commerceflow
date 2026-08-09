type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const EXACT_CATEGORY_UNSPLASH_MAP: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80',
  'fashion-men': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
  'fashion-women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  kids: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
  fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'pet-supplies': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  'office-supplies': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
};

const EXACT_SUBCATEGORY_UNSPLASH_MAP: Record<string, string[]> = {
  // Electronics
  'phones': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
  ],
  'laptops': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
  ],
  'tablets': [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
  ],
  'monitors': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80',
  ],
  'keyboards': [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
  ],
  'mouse': [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  ],
  'gaming': [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
  'cameras': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  ],
  'earbuds': [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  ],
  'headphones': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  ],
  'smart-watches': [
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
  ],

  // Fashion & Apparel
  't-shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
  ],
  'shirts': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
  ],
  'jeans': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
  ],
  'dresses': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  ],

  // Shoes
  'running-shoes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  ],
  'casual-shoes': [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
  ],
  'formal-shoes': [
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
  ],

  // Furniture
  'sofas': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  ],
  'beds': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  ],
  'tables': [
    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
  ],
  'chairs': [
    'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?auto=format&fit=crop&w=800&q=80',
  ],
};

export function getCategoryImage(categorySlug: string): string {
  const catKey = categorySlug.toLowerCase();
  return EXACT_CATEGORY_UNSPLASH_MAP[catKey] || 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80';
}

export function getProductImages(product: ProductInfo, _productIndex?: number) {
  const nameLower = (product.name || '').toLowerCase();
  const subKey = (product.subcategory || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const catKey = (product.categorySlug || '').toLowerCase();

  let pool: string[] = [];

  // 1. High-priority product name keyword matching
  if (nameLower.includes('dualsense') || nameLower.includes('xbox controller') || nameLower.includes('controller') || nameLower.includes('gamepad')) {
    pool = [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('steam deck') || nameLower.includes('rog ally') || nameLower.includes('switch') || nameLower.includes('ps vr') || nameLower.includes('playstation') || nameLower.includes('xbox series')) {
    pool = [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('huntsman') || nameLower.includes('blackwidow') || nameLower.includes('k70') || nameLower.includes('keyboard') || nameLower.includes('rk royal') || nameLower.includes('keychron') || nameLower.includes('g915') || nameLower.includes('mx mechanical')) {
    pool = [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('macbook') || nameLower.includes('xps') || nameLower.includes('spectre') || nameLower.includes('thinkpad') || nameLower.includes('zenbook') || nameLower.includes('laptop') || nameLower.includes('surface laptop') || nameLower.includes('predator helios') || nameLower.includes('stealth') || nameLower.includes('blade')) {
    pool = [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('ultragear') || nameLower.includes('ultrasharp') || nameLower.includes('rog swift') || nameLower.includes('monitor') || nameLower.includes('display') || nameLower.includes('thinkvision')) {
    pool = [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('galaxy s') || nameLower.includes('iphone') || nameLower.includes('oneplus') || nameLower.includes('pixel') || nameLower.includes('nothing phone') || nameLower.includes('realme') || nameLower.includes('vivo') || nameLower.includes('oppo') || nameLower.includes('moto') || nameLower.includes('phone')) {
    pool = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('watch') || nameLower.includes('garmin') || nameLower.includes('ticwatch') || nameLower.includes('amazfit') || nameLower.includes('suunto')) {
    pool = [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('mouse') || nameLower.includes('g502') || nameLower.includes('viper') || nameLower.includes('deathadder') || nameLower.includes('superlight') || nameLower.includes('mx master')) {
    pool = [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('camera') || nameLower.includes('canon') || nameLower.includes('nikon') || nameLower.includes('fujifilm') || nameLower.includes('gopro') || nameLower.includes('lumix') || nameLower.includes('sony a1')) {
    pool = [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('headphone') || nameLower.includes('wh-1000') || nameLower.includes('quietcomfort ultra') || nameLower.includes('momentum') || nameLower.includes('studio pro')) {
    pool = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('earbud') || nameLower.includes('airpod') || nameLower.includes('buds')) {
    pool = [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('boot') || nameLower.includes('sandal') || nameLower.includes('slipper') || nameLower.includes('flip flop')) {
    pool = [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    ];
  } else if (EXACT_SUBCATEGORY_UNSPLASH_MAP[subKey] && EXACT_SUBCATEGORY_UNSPLASH_MAP[subKey].length > 0) {
    pool = EXACT_SUBCATEGORY_UNSPLASH_MAP[subKey];
  } else {
    pool = [EXACT_CATEGORY_UNSPLASH_MAP[catKey] || 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=800&q=80'];
  }

  const productIdentity = `${product.name}:${product.brand || 'generic'}`;
  const hash = simpleHash(productIdentity);

  return Array.from({ length: 4 }).map((_, order) => {
    const url = pool[(hash + order) % pool.length];
    return {
      url,
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

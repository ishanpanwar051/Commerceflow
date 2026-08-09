import { imagePools } from './image-pools';

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

function toUnsplashUrl(photoId: string): string {
  if (photoId.startsWith('http')) return photoId;
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`;
}

// Keyword-specific photo ID pools for granular matching
const KEYWORD_PHOTO_POOLS: Record<string, string[]> = {
  // Office & Stationery
  whiteboard: [
    'photo-1544716278-ca5e3f4abd8c',
    'photo-1531403009284-440f080d1e12',
    'photo-1517245386807-bb43f82c33c4',
    'photo-1434030216411-0b793f4b4173',
  ],
  stapler: [
    'photo-1588880331179-bc9b93a8cb5e',
    'photo-1517842645767-c639042777db',
    'photo-1484480974693-6ca0a78fb36b',
  ],
  organizer: [
    'photo-1588880331179-bc9b93a8cb5e',
    'photo-1564939558297-fc396f18e5c7',
    'photo-1624969862293-b749659ccc4e',
  ],
  folder: [
    'photo-1586281380349-632531db7ed4',
    'photo-1517842645767-c639042777db',
    'photo-1484480974693-6ca0a78fb36b',
  ],
  paper: [
    'photo-1586075010923-2dd4570fb338',
    'photo-1517842645767-c639042777db',
    'photo-1456735190827-d1262f71b8a3',
  ],
  pen: [
    'photo-1583485088034-697b5bc54ccd',
    'photo-1585336261026-8f5786372961',
    'photo-1517842645767-c639042777db',
  ],
  notebook: [
    'photo-1544716278-ca5e3f4abd8c',
    'photo-1517842645767-c639042777db',
    'photo-1516962215378-7fa2e137ae93',
  ],
  printer: [
    'photo-1612815154858-60aa4c59eaa6',
    'photo-1563986768609-322da13575f3',
    'photo-1588880331179-bc9b93a8cb5e',
  ],

  // Automotive
  helmet: [
    'photo-1558981806-ec527fa84c39',
    'photo-1542282088-fe8426682b8f',
    'photo-1519641471654-76ce0107ad1b',
  ],
  riding: [
    'photo-1558981403-c5f9899a28bc',
    'photo-1568772585407-9361f9bf3a87',
    'photo-1558981806-ec527fa84c39',
  ],
  bike: [
    'photo-1558981403-c5f9899a28bc',
    'photo-1568772585407-9361f9bf3a87',
    'photo-1558980664-769d59546b3d',
  ],
  car: [
    'photo-1492144534655-ae79c964c9d7',
    'photo-1503376780353-7e6692767b70',
    'photo-1619405399517-d7fce0f13302',
    'photo-1542282088-fe8426682b8f',
  ],
  lubricant: [
    'photo-1486006920555-c77dce18193b',
    'photo-1583121274602-3e2820c69888',
    'photo-1502877338535-766e1452684a',
  ],
  tool: [
    'photo-1581092160607-ee22621dd758',
    'photo-1504148455328-c376907d081c',
    'photo-1581092335397-9583fe92d232',
  ],

  // Women Fashion
  legging: [
    'photo-1506629082955-511b1aa562c8',
    'photo-1515886657613-9f3515b0c78f',
    'photo-1539533018447-63fcce2678e3',
  ],
  saree: [
    'photo-1610030469983-98e550d6193c',
    'photo-1617627143750-d86bc21e42bb',
    'photo-1609357605129-26f69add5d6e',
  ],
  kurta: [
    'photo-1583391733956-6c78276477e2',
    'photo-1617627143750-d86bc21e42bb',
    'photo-1585487000160-6ebcfceb0d03',
  ],
  jacket: [
    'photo-1551028719-00167b16eac5',
    'photo-1544441893-675973e31985',
    'photo-1548883354-7622d03aca27',
  ],
  skirt: [
    'photo-1583496661160-fb5886a0aaaa',
    'photo-1572804013309-59a88b7e92f1',
    'photo-1582142306909-195724d33ffc',
  ],
  dress: [
    'photo-1595777457583-95e059d581b8',
    'photo-1572804013309-59a88b7e92f1',
    'photo-1515886657613-9f3515b0c78f',
  ],
  trousers: [
    'photo-1624378439575-d8705ad7ae80',
    'photo-1594633313593-bab3825d0caf',
    'photo-1506629082955-511b1aa562c8',
  ],
  jean: [
    'photo-1541099649105-f69ad21f3246',
    'photo-1582552938357-32b906df40cb',
    'photo-1542272604-780c36856f61',
  ],
  shirt: [
    'photo-1596755094514-f87e34085b2c',
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1620012253295-c15cc3e65df4',
  ],

  // Shoes
  shoes: [
    'photo-1542291026-7eec264c27ff',
    'photo-1525966222134-fcfa99b8ae77',
    'photo-1614252235316-8c857d38b5f4',
    'photo-1560769629-975ec94e6a86',
    'photo-1595950653106-6c9ebd614d3a',
    'photo-1584735935682-2f2b69dff9d2',
  ],

  // Electronics
  headphone: [
    'photo-1505740420928-5e560c06d30e',
    'photo-1546435770-a3e426bf472b',
    'photo-1484704849700-f032a568e944',
  ],
  laptop: [
    'photo-1517336714731-489689fd1ca8',
    'photo-1496181133206-80ce9b88a853',
    'photo-1593642632823-8f785ba67e45',
  ],
  phone: [
    'photo-1511707171634-5f897ff02aa9',
    'photo-1598327105666-5b89351aff97',
    'photo-1565849904461-04a58ad377e0',
  ],
  watch: [
    'photo-1508685096489-7aacd43bd3b1',
    'photo-1579586337278-3befd40fd17a',
    'photo-1523275335684-37898b6baf30',
  ],
};

const CATEGORY_DEFAULT_IMAGE: Record<string, string> = {
  electronics: 'photo-1498049860654-af1a5c566876',
  'fashion-men': 'photo-1617137968427-85924c800a22',
  'fashion-women': 'photo-1483985988355-763728e1935b',
  kids: 'photo-1515488042361-ee00e0ddd4e4',
  shoes: 'photo-1542291026-7eec264c27ff',
  sports: 'photo-1461896836934-ffe607ba8211',
  beauty: 'photo-1522337360788-8b13dee7a37e',
  'home-decor': 'photo-1513694203232-719a280e022f',
  kitchen: 'photo-1556911220-e15b29be8c8f',
  furniture: 'photo-1555041469-a586c61ea9bc',
  books: 'photo-1497633762265-9d179a990aa6',
  toys: 'photo-1566576912321-d58ddd7a6088',
  fitness: 'photo-1517838277536-f5f99be501cd',
  groceries: 'photo-1542838132-92c53300491e',
  'pet-supplies': 'photo-1583511655857-d19b40a7a54e',
  automotive: 'photo-1503376780353-7e6692767b70',
  'office-supplies': 'photo-1456735190827-d1262f71b8a3',
};

export function getCategoryImage(categorySlug: string): string {
  const catKey = (categorySlug || '').toLowerCase();
  const photoId = CATEGORY_DEFAULT_IMAGE[catKey] || 'photo-1498049860654-af1a5c566876';
  return toUnsplashUrl(photoId);
}

export function getProductImages(product: ProductInfo, productIndex: number = 0) {
  const nameLower = (product.name || '').toLowerCase();
  const catKey = (product.categorySlug || '').toLowerCase();

  let pool: string[] = [];

  // 1. Try keyword pools
  for (const [kw, photos] of Object.entries(KEYWORD_PHOTO_POOLS)) {
    if (nameLower.includes(kw)) {
      pool = photos;
      break;
    }
  }

  // 2. Try main category pool from image-pools.ts
  if (pool.length === 0 && imagePools[catKey] && imagePools[catKey].length > 0) {
    pool = imagePools[catKey];
  }

  // 3. Global fallback pool
  if (pool.length === 0) {
    pool = [
      'photo-1498049860654-af1a5c566876',
      'photo-1505740420928-5e560c06d30e',
      'photo-1523275335684-37898b6baf30',
      'photo-1517336714731-489689fd1ca8',
      'photo-1542291026-7eec264c27ff',
      'photo-1515488042361-ee00e0ddd4e4',
    ];
  }

  // Use product identity hash + productIndex to select distinct images
  const identity = `${product.name}:${product.brand || 'generic'}:${productIndex}`;
  const hash = simpleHash(identity);

  return Array.from({ length: 4 }).map((_, order) => {
    // Offset each image order so gallery images are also distinct
    const photoIdx = (hash + order * 3 + productIndex) % pool.length;
    const photoId = pool[photoIdx];
    return {
      url: toUnsplashUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

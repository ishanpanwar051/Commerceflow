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

// Comprehensive keyword-to-photo mapping covering all subcategories across 17 parent categories
const KEYWORD_PHOTO_POOLS: Record<string, string[]> = {
  // --- Electronics ---
  phone: ['photo-1511707171634-5f897ff02aa9', 'photo-1598327105666-5b89351aff97', 'photo-1565849904461-04a58ad377e0', 'photo-1512058564366-18510be2db19'],
  laptop: ['photo-1517336714731-489689fd1ca8', 'photo-1496181133206-80ce9b88a853', 'photo-1593642632823-8f785ba67e45', 'photo-1588872657578-7efd1f1555ed'],
  tablet: ['photo-1544244015-0df4b3ffc6b0', 'photo-1561154464-82e9adf32764', 'photo-1585790050230-5dd28404ccb9'],
  monitor: ['photo-1527443224154-c4a3942d3acf', 'photo-1586210579191-33b45e38fa2c', 'photo-1547119957-637f8679db1e'],
  keyboard: ['photo-1587829741301-dc798b83add3', 'photo-1618384887929-16ec33fab9ef', 'photo-1595225476474-87563907a212'],
  mouse: ['photo-1615663245857-ac93bb7c39e7', 'photo-1527864550417-7fd91fc51a46', 'photo-1629429408209-1f912961dbd8'],
  game: ['photo-1607604276583-eef5d076aa5f', 'photo-1605901309584-818e25960a8f', 'photo-1550745165-9bc0b252726f', 'photo-1592840496694-26d035b52b48'],
  playstation: ['photo-1607604276583-eef5d076aa5f', 'photo-1605901309584-818e25960a8f'],
  xbox: ['photo-1605901309584-818e25960a8f', 'photo-1550745165-9bc0b252726f'],
  camera: ['photo-1516035069371-29a1b244cc32', 'photo-1526170375885-4d8ecf77b99f', 'photo-1502920917128-1aa500764cbd'],
  earbud: ['photo-1590658268037-6bf12165a8df', 'photo-1606220588913-b3aacb4d2f46', 'photo-1572569511254-d8f925fe2cbb'],
  headphone: ['photo-1505740420928-5e560c06d30e', 'photo-1546435770-a3e426bf472b', 'photo-1484704849700-f032a568e944'],
  speaker: ['photo-1545454675-3531b543be5d', 'photo-1608043152269-423dbba4e7e1', 'photo-1508700115892-45ecd05ae2ad'],
  watch: ['photo-1508685096489-7aacd43bd3b1', 'photo-1579586337278-3befd40fd17a', 'photo-1523275335684-37898b6baf30'],
  power: ['photo-1609081219090-a6d81d3085bf', 'photo-1583863788434-e58a36330cf0', 'photo-1592750475338-74b7b21085ab'],
  charger: ['photo-1583863788434-e58a36330cf0', 'photo-1585338107529-13afc5f02586', 'photo-1609081219090-a6d81d3085bf'],
  ssd: ['photo-1597852074816-d933c7d2b988', 'photo-1544652478-6653e09f18a2', 'photo-1587202372775-e229f172b9d7'],
  router: ['photo-1544197150-b99a580bb7a8', 'photo-1601784551446-20c9e07cdbdb', 'photo-1563770660941-20978e870e26'],

  // --- Fashion Men ---
  't-shirt': ['photo-1521572267360-ee0c2909d518', 'photo-1583743814966-8936f5b7be1a', 'photo-1618354691373-d851c5c3a990'],
  shirt: ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1620012253295-c15cc3e65df4'],
  jean: ['photo-1541099649105-f69ad21f3246', 'photo-1582552938357-32b906df40cb', 'photo-1542272604-780c36856f61'],
  trouser: ['photo-1624378439575-d8705ad7ae80', 'photo-1473966968600-fa801b869a1a', 'photo-1506629082955-511b1aa562c8'],
  chino: ['photo-1624378439575-d8705ad7ae80', 'photo-1473966968600-fa801b869a1a'],
  suit: ['photo-1507679799987-c73779587ccf', 'photo-1594938298603-c8148c4dae35', 'photo-1593032465175-481ac7f402a1'],
  blazer: ['photo-1507679799987-c73779587ccf', 'photo-1594938298603-c8148c4dae35'],
  sweater: ['photo-1556905055-8f358a7a47b2', 'photo-1620799140408-edc6dcb6d633', 'photo-1578587018452-892bacefd3f2'],
  hoodie: ['photo-1556905055-8f358a7a47b2', 'photo-1620799140408-edc6dcb6d633'],
  short: ['photo-1591195853828-11db59a44f6b', 'photo-1562157873-818bc0726f68'],
  belt: ['photo-1553062407-98eeb64c6a62', 'photo-1627123424574-724758594e93'],
  wallet: ['photo-1627123424574-724758594e93', 'photo-1606503153255-59d8b8b82176'],
  sunglass: ['photo-1511499767150-a48a237f0083', 'photo-1572635196237-14b3f281503f', 'photo-1508296695146-257a814070b4'],
  tie: ['photo-1598554747436-c9293d6a588f', 'photo-1588850561407-ed78c282e89b'],
  cap: ['photo-1588850561407-ed78c282e89b', 'photo-1576871337632-b9aef4c17ab9'],

  // --- Fashion Women ---
  dress: ['photo-1595777457583-95e059d581b8', 'photo-1572804013309-59a88b7e92f1', 'photo-1515886657613-9f3515b0c78f', 'photo-1539109136881-3be0616acf4b'],
  top: ['photo-1503342217505-b0a15ec3261c', 'photo-1585487000160-6ebcfceb0d03', 'photo-1564257631407-4deb129f0549'],
  skirt: ['photo-1583496661160-fb5886a0aaaa', 'photo-1572804013309-59a88b7e92f1', 'photo-1582142306909-195724d33ffc'],
  kurta: ['photo-1583391733956-6c78276477e2', 'photo-1617627143750-d86bc21e42bb', 'photo-1610030469983-98e550d6193c'],
  saree: ['photo-1610030469983-98e550d6193c', 'photo-1617627143750-d86bc21e42bb', 'photo-1609357605129-26f69add5d6e'],
  legging: ['photo-1506629082955-511b1aa562c8', 'photo-1515886657613-9f3515b0c78f', 'photo-1539533018447-63fcce2678e3'],
  jacket: ['photo-1544441893-675973e31985', 'photo-1548883354-7622d03aca27', 'photo-1591369822096-ffd140ec948f'],
  handbag: ['photo-1584917865442-de89df76afd3', 'photo-1590874103328-eac38a683ce7', 'photo-1566150905458-1bf1fc113f0d'],
  jewelry: ['photo-1599643478518-a784e5dc4c8f', 'photo-1515562141207-7a88fb7ce338', 'photo-1605100804763-247f67b3557e'],
  heel: ['photo-1543163521-1bf539c55dd2', 'photo-1560343776-97e7d202ff0e', 'photo-1595950653106-6c9ebd614d3a'],
  scarf: ['photo-1601924994987-69e26d50dc26', 'photo-1520903920243-00d872a2d1c9', 'photo-1584030373081-f37b7bb4fa8e'],

  // --- Shoes ---
  shoe: ['photo-1542291026-7eec264c27ff', 'photo-1525966222134-fcfa99b8ae77', 'photo-1614252235316-8c857d38b5f4', 'photo-1560769629-975ec94e6a86'],
  sneaker: ['photo-1525966222134-fcfa99b8ae77', 'photo-1560769629-975ec94e6a86', 'photo-1600185365926-3a2ce3cdb9eb'],
  boot: ['photo-1520639888713-7851133b1ed0', 'photo-15422834369-f10e594c22b0', 'photo-1549298916-b41d501d3772'],
  sandal: ['photo-1603808033192-082d6919d3e1', 'photo-1562273138-f46be4ebdf33', 'photo-1575410229391-19b4da01cc94'],

  // --- Home & Kitchen & Furniture ---
  sofa: ['photo-1555041469-a586c61ea9bc', 'photo-1586023492125-27b2c045efd7', 'photo-1540574163026-643ea20ade25'],
  bed: ['photo-1505693416388-ac5ce068fe85', 'photo-1505691938895-1758d7feb511'],
  table: ['photo-1530018607912-eff2daa1bac4', 'photo-1518455027359-f3f8164ba6bd', 'photo-1538688525198-9b88f6f53126'],
  chair: ['photo-1580481072645-022f9a6d1270', 'photo-1567538096630-e0c55bd6374c', 'photo-1503602642458-232111445657'],
  cookware: ['photo-1556911220-e15b29be8c8f', 'photo-1584992236310-6edddc08acff', 'photo-1556909114-f6e7ad7d3136'],
  knife: ['photo-1593618998160-e34014e67546', 'photo-1589365278144-59e9678e3489'],
  skillet: ['photo-1584992236310-6edddc08acff', 'photo-1556911220-e15b29be8c8f'],
  press: ['photo-1514432324607-a09d9b4aefdd', 'photo-1517256064527-09c73fc73e38'],
  kettle: ['photo-1577968897966-3d4325b36b61', 'photo-1556909114-f6e7ad7d3136'],
  lamp: ['photo-1507473885765-e6ed057f782c', 'photo-1513694203232-719a280e022f'],

  // --- Sports & Fitness ---
  cricket: ['photo-1531415074968-036ba1b575da', 'photo-1540747913346-19e32dc3e97e'],
  football: ['photo-1579952363873-27f3bade9f55', 'photo-1574629810360-7efbbe195018'],
  basketball: ['photo-1519861531473-9200262188bf', 'photo-1546519638-68e109498ffc'],
  tennis: ['photo-1622279457486-62dcc4a431d6', 'photo-1626224583764-f87db24ac4ea'],
  badminton: ['photo-1626224583764-f87db24ac4ea', 'photo-1554068865-24cecd4e34b8'],
  swimming: ['photo-1530549387789-4c1017266635', 'photo-1519315901367-f34ff9154487'],
  cycling: ['photo-1485965120184-e220f721d03e', 'photo-1507035895480-2b3156c31fc8'],
  yoga: ['photo-1544367567-0f2fcb009e0b', 'photo-1506126613408-eca07ce68773', 'photo-1599447421416-3414500d18a5'],
  weight: ['photo-1517836357463-d25dfeac3438', 'photo-1534438327276-14e5300c3a48'],
  protein: ['photo-1579722821273-0f6c7d44362f', 'photo-1584017911766-d451b3d0e843'],

  // --- Beauty ---
  makeup: ['photo-1522337360788-8b13dee7a37e', 'photo-1512496015851-a90fb38ba796', 'photo-1596462502278-27bfdc403348'],
  skincare: ['photo-1556228720-195a672e8a03', 'photo-1570172619644-dfd03ed5d881', 'photo-1608248543803-ba4f8c70ae0b'],
  perfume: ['photo-1592945403244-b3fbafd7f539', 'photo-1547887537-6158d64c35b3', 'photo-1588405748880-12d1d2a59f75'],

  // --- Automotive ---
  helmet: ['photo-1558981806-ec527fa84c39', 'photo-1542282088-fe8426682b8f', 'photo-1519641471654-76ce0107ad1b'],
  riding: ['photo-1558981403-c5f9899a28bc', 'photo-1568772585407-9361f9bf3a87', 'photo-1558981806-ec527fa84c39'],
  bike: ['photo-1558981403-c5f9899a28bc', 'photo-1568772585407-9361f9bf3a87', 'photo-1558980664-769d59546b3d'],
  car: ['photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70', 'photo-1619405399517-d7fce0f13302', 'photo-1542282088-fe8426682b8f'],
  lubricant: ['photo-1486006920555-c77dce18193b', 'photo-1583121274602-3e2820c69888', 'photo-1502877338535-766e1452684a'],
  tool: ['photo-1581092160607-ee22621dd758', 'photo-1504148455328-c376907d081c', 'photo-1581092335397-9583fe92d232'],

  // --- Office Supplies ---
  whiteboard: ['photo-1544716278-ca5e3f4abd8c', 'photo-1531403009284-440f080d1e12', 'photo-1517245386807-bb43f82c33c4', 'photo-1434030216411-0b793f4b4173'],
  stapler: ['photo-1588880331179-bc9b93a8cb5e', 'photo-1517842645767-c639042777db', 'photo-1484480974693-6ca0a78fb36b'],
  organizer: ['photo-1588880331179-bc9b93a8cb5e', 'photo-1564939558297-fc396f18e5c7', 'photo-1624969862293-b749659ccc4e'],
  folder: ['photo-1586281380349-632531db7ed4', 'photo-1517842645767-c639042777db', 'photo-1484480974693-6ca0a78fb36b'],
  paper: ['photo-1586075010923-2dd4570fb338', 'photo-1517842645767-c639042777db', 'photo-1456735190827-d1262f71b8a3'],
  pen: ['photo-1583485088034-697b5bc54ccd', 'photo-1585336261026-8f5786372961', 'photo-1517842645767-c639042777db'],
  notebook: ['photo-1544716278-ca5e3f4abd8c', 'photo-1517842645767-c639042777db', 'photo-1516962215378-7fa2e137ae93'],
  printer: ['photo-1612815154858-60aa4c59eaa6', 'photo-1563986768609-322da13575f3', 'photo-1588880331179-bc9b93a8cb5e'],

  // --- Books, Groceries, Pet Supplies ---
  book: ['photo-1544716278-ca5e3f4abd8c', 'photo-1512820790803-83ca734da794', 'photo-1524995997946-a1c2e315a42f', 'photo-1497633762265-9d179a990aa6'],
  grocery: ['photo-1542838132-92c53300491e', 'photo-1578916171728-46686eac8d58', 'photo-1588964895597-cfccd6e2dbf9'],
  pet: ['photo-1583511655857-d19b40a7a54e', 'photo-1543466835-00a7907e9de1', 'photo-1535294435445-d7249524ef2e'],
  dog: ['photo-1543466835-00a7907e9de1', 'photo-1583511655857-d19b40a7a54e'],
  cat: ['photo-1514888286974-6c03e2ca1dba', 'photo-1533738363-b7f9aef128ce'],
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
  const subLower = (product.subcategory || '').toLowerCase();
  const catKey = (product.categorySlug || '').toLowerCase();

  let pool: string[] = [];

  // 1. Keyword check against product name & subcategory
  for (const [kw, photos] of Object.entries(KEYWORD_PHOTO_POOLS)) {
    if (nameLower.includes(kw) || subLower.includes(kw)) {
      pool = photos;
      break;
    }
  }

  // 2. Main category pool from image-pools.ts
  if (pool.length === 0 && imagePools[catKey] && imagePools[catKey].length > 0) {
    pool = imagePools[catKey];
  }

  // 3. Fallback pool
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

  const identity = `${product.name}:${product.brand || 'generic'}:${productIndex}`;
  const hash = simpleHash(identity);

  return Array.from({ length: 4 }).map((_, order) => {
    // Unique photo selection per product & order
    const photoIdx = (hash + order * 3 + productIndex * 7) % pool.length;
    const photoId = pool[photoIdx];
    return {
      url: toUnsplashUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

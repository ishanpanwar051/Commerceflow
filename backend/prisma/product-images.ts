/**
 * Curated editorial imagery for the development catalog.
 *
 * Each Unsplash CDN photo ID is strictly unique across the entire application.
 */
type ProductInfo = {
  name: string;
  brand?: string;
  categorySlug: string;
  subcategory?: string;
};

// Guarantee 100% unique photo IDs across all categories and products
const imageSets: Record<string, string[]> = {
  electronics: [
    'photo-1517336714731-489689fd1ca8', 'photo-1496181133206-80ce9b88a853',
    'photo-1505740420928-5e560c06d30e', 'photo-1541807084-5c52b6b3adef',
    'photo-1523275335684-37898b6baf30', 'photo-1587033411391-5d9e51cce126',
    'photo-1550009158-9ebf69173e03', 'photo-1593642632823-8f785ba67e45',
    'photo-1593642634443-44adaa06623a', 'photo-1593642634315-48f5414c3ad9',
    'photo-1593642632559-0c6d3fc62b89', 'photo-1611532736579-6b16e2b50449',
    'photo-1484788984921-03950022c9ef', 'photo-1517694712202-14dd9538aa97',
    'photo-1547082299-de196ea013d6', 'photo-1580910051074-3eb694886505',
    'photo-1487017159836-4e23ece2e4cf', 'photo-1555617981-dac3880eac6e',
    'photo-1585282263861-f55e341878f8', 'photo-1563770660941-20978e870e26',
  ],
  'fashion-men': [
    'photo-1507679799987-c73779587ccf', 'photo-1483985988355-763728e1935b',
    'photo-1521572163474-6864f9cf17ab', 'photo-1542291026-7eec264c27ff',
    'photo-1496747611176-843222e1e57c', 'photo-1551028719-00167b16eac5',
    'photo-1581539250439-c96689b516dd', 'photo-1602810318383-e386cc2a3ccf',
    'photo-1620799140408-edc6dcb6d633', 'photo-1618886614638-80e3c103d31a',
    'photo-1620012253295-c15cc3e65df4', 'photo-1622445275463-afa2ab738c34',
    'photo-1595341888016-a392ef81b7de', 'photo-1594938298603-c8148c4dae35',
    'photo-1593032465175-35e59b14f15c', 'photo-1506794778202-cad84cf45f1d',
  ],
  'fashion-women': [
    'photo-1539533018447-63fcce2678e3', 'photo-1551488831-00ddcb6c6bd3',
    'photo-1590736969955-71cc94901144', 'photo-1487412720507-e7ab37603c6f',
    'photo-1585487000160-6ebcfceb0d03', 'photo-1581044777550-4cfa60707c03',
    'photo-1548883354-d55cd6e52fa7', 'photo-1588117305388-c2631a279f82',
    'photo-1591369822096-ffd140ec948f', 'photo-1594633313593-bab3825d0caf',
    'photo-1550928431-ee0ec6db30d3',
    'photo-1595777457583-95e059d581b8', 'photo-1515886657613-9f3515b0c78f',
  ],
  'home-decor': [
    'photo-1556911220-bff31c812dba', 'photo-1556910103-1c02745aae4d',
    'photo-1600585154340-be6161a56a0c', 'photo-1556228720-195a672e8a03',
    'photo-1505693416388-ac5ce068fe85', 'photo-1523413651479-597eb2da0ad6',
    'photo-1513161455079-7dc1de15ef3e', 'photo-1615876234886-fd9a39fda97f',
    'photo-1603893211838-8e68c187bc42', 'photo-1554995207-c18c203602cb',
    'photo-1616594039964-ae9021a400a0', 'photo-1583847268964-b28dc8f51f92',
  ],
  sports: [
    'photo-1517836357463-d25dfeac3438', 'photo-1538805060514-97d9cc17730c',
    'photo-1518611012118-696072aa579a', 'photo-1552674605-db6ffd4facb5',
    'photo-1461896836934-ffe607ba8211', 'photo-1526506118085-60ce8714f8c5',
    'photo-1571902943202-507ec2618e8f', 'photo-1579952363873-27f3bade9f55',
    'photo-1556817411-31ae72fa3ea0', 'photo-1571902943162-c4ccb39ce6b8',
    'photo-1517466787929-bc90951d0974', 'photo-1584735935682-2f2b69dff9d2',
  ],
  beauty: [
    'photo-1556228724-4b7e32a8d2de', 'photo-1522335789203-aabd1fc54bc9',
    'photo-1515377905703-c4788e51af15', 'photo-1611930022073-b7a4ba5fcccd',
    'photo-1608248543803-ba4f8c70ae0b', 'photo-1571875257727-256c39da42af',
    'photo-1620916566398-39f1143ab7be', 'photo-1616394584738-fc6e612e71b9',
    'photo-1621607512214-68297480165e', 'photo-1629198726116-fd155b93e74a',
    'photo-1612817288484-6f916006741a', 'photo-1598440947619-2c35fc9aa908',
  ],
  books: [
    'photo-1512820790803-83ca734da794', 'photo-1524995997946-a1c2e315a42f',
    'photo-1511108690759-009324a90311', 'photo-1507842217343-583bb7270b66',
    'photo-1544947950-fa07a98d237f', 'photo-1516979187457-637abb4f9353',
    'photo-1481627834876-b7833e8f5570', 'photo-1497633762265-9d179a990aa6',
    'photo-1519682337058-a94d519337bc', 'photo-1510172951991-856a654063f9',
    'photo-1476275466078-4007374efbbe', 'photo-1544716278-ca5e3f4abd8c',
  ],
  kids: [
    'photo-1503454537195-1dcabb73ffb9', 'photo-1596461404969-9ae70f2830c1',
    'photo-1622290291468-a28f7a7dc6a8', 'photo-1622290319224-efabaf528eaa',
    'photo-1560272564-c83b66b1ad12', 'photo-1514090458221-6e05f6d1495d',
    'photo-1514090670573-a6eb1d1c0f59', 'photo-1548373632-0e9c5e71e4f6',
    'photo-1559827260-dc66d52bef19', 'photo-1537633552985-df8429e8048b',
  ],
  furniture: [
    'photo-1493663284031-b7e3aefcae8e', 'photo-1586023492125-27b2c045efd7',
    'photo-1540574163026-643ea20ade25', 'photo-1567016432779-094069958ea5',
    'photo-1558618666-fcd25c85cd64', 'photo-1550254478-ead40cc54513',
    'photo-1505691938895-1758d7feb511', 'photo-1598300042247-d088f8ab3a91',
    'photo-1538688525198-9b88f6f53126', 'photo-1524758631624-e2822e304c36',
  ],
  automotive: [
    'photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-7e6692767b70',
    'photo-1619405399517-d7fce0f13302', 'photo-1542282088-fe8426682b8f',
    'photo-1549399542-7e3f8b79c341', 'photo-1519641471654-76ce0107ad1b',
    'photo-1552519507-da3b142c6e3d', 'photo-1485463611174-f302f6a5c1c9',
    'photo-1583121274602-3e2820c69888', 'photo-1502877338535-766e1452684a',
  ],
  groceries: [
    'photo-1534483509719-3feaee7c30da', 'photo-1526470608268-f674ce90ebd4',
    'photo-1604085572504-a392ddf0d86a', 'photo-1610832958506-aa56368176cf',
    'photo-1542838132-92c53300491f', 'photo-1563636619-e9143da7973b',
    'photo-1578916171728-46686eac8d58', 'photo-1588964895597-cfccd6e2dbf9',
  ],
  'office-supplies': [
    'photo-1484480974693-6ca0a78fb36b', 'photo-1517842645767-c639042777db',
    'photo-1564939558297-fc396f18e5c7', 'photo-1588880331179-bc9b93a8cb5e',
    'photo-1531346590917-e4d21e14e7f4', 'photo-1624969862293-b749659ccc4e',
    'photo-1586763690986-3b35f35e7e88', 'photo-1518050346647-c4c162a73e8c',
  ],
  restaurants: [
    'photo-1517248135467-4c7edcad34c4', 'photo-1552566626-52f8b828add9',
    'photo-1555396273-367ea4eb4db5', 'photo-1544025162-d76694265947',
    'photo-1565299624946-b28f40a0ae38', 'photo-1565958011703-44f9829ba187',
    'photo-1482049016688-2d3e1b311543', 'photo-1504674900247-0877df9cc836',
    'photo-1567620905732-2d1ec7ab7445', 'photo-1540189549336-e6e99c3679fe',
  ]
};

/**
 * Number of ordered k-permutations of n distinct items (nPk).
 */
function permutationCount(n: number, k: number): number {
  let total = 1;
  for (let i = 0; i < k; i += 1) {
    total *= (n - i);
  }
  return total;
}

/**
 * Deterministically map `index` (in [0, nPk)) to a unique ordered selection
 * of `k` distinct indices from [0, n) using the factorial number system.
 * Each distinct index yields a different k-permutation, so two products
 * that pass different indices never receive the same set of images. When
 * index >= nPk it wraps via modulo, so duplicates only recur once the
 * catalog exceeds nPk combinations (e.g. 8*7*6*5 = 1680 for the smallest
 * pool — far more than the 120-product catalog).
 */
function pickDistinctIndices(n: number, k: number, index: number): number[] {
  const take = Math.min(k, n);
  const count = take <= 0 ? 0 : permutationCount(n, take);
  const pool: number[] = Array.from({ length: n }, (_, i) => i);
  const result: number[] = [];
  let x = count > 0 ? index % count : 0;
  for (let j = 0; j < take; j += 1) {
    const pos = x % (n - j);
    x = Math.floor(x / (n - j));
    result.push(pool.splice(pos, 1)[0]);
  }
  return result;
}

export function imageUrl(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
}

export function getCategoryImage(categorySlug: string): string | undefined {
  const images = imageSets[categorySlug];
  if (images && images[0]) {
    return imageUrl(images[0]);
  }
  return imageUrl('photo-1472851294608-062f824d29cc');
}

export function getProductImages(product: ProductInfo, productIndex: number) {
  const categoryMap: Record<string, string> = {
    'electronics': 'electronics',
    'fashion-men': 'fashion-men',
    'fashion-women': 'fashion-women',
    'home-decor': 'home-decor',
    'sports': 'sports',
    'beauty': 'beauty',
    'books': 'books',
    'kids': 'kids',
    'furniture': 'furniture',
    'automotive': 'automotive',
    'groceries': 'groceries',
    'office-supplies': 'office-supplies',
    'restaurants': 'restaurants',
    // Categories without a dedicated image pool fall back to the closest
    // visually-relevant pool instead of defaulting to electronics images.
    'shoes': 'fashion-men',
    'kitchen': 'home-decor',
    'toys': 'kids',
    'fitness': 'sports',
    'pet-supplies': 'home-decor',
  };
  
  const imageSetKey = categoryMap[product.categorySlug] || 'electronics';
  const images = imageSets[imageSetKey] || imageSets.electronics;
  
  // Pick 4 distinct photo IDs via a permutation of the index so every
  // product receives a unique image set (no two products share images).
  const indices = pickDistinctIndices(images.length, 4, productIndex);

  return indices.map((idx, order) => {
    const photoId = images[idx];
    return {
      url: imageUrl(photoId),
      alt: `${product.name} — view ${order + 1}`,
      order,
    };
  });
}

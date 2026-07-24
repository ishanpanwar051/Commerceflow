/**
 * Curated editorial imagery for the development catalog.
 *
 * These are immutable Unsplash CDN assets rather than generated placeholder
 * URLs. Keeping the resolver deterministic means a reseed never changes a
 * product's gallery or causes unnecessary database churn.
 */
type ProductInfo = {
  name: string;
  brand: string;
  categorySlug: string;
  subcategory: string;
};

const imageSets: Record<string, string[]> = {
  electronics: [
    'photo-1517336714731-489689fd1ca8', 'photo-1496181133206-80ce9b88a853',
    'photo-1505740420928-5e560c06d30e', 'photo-1541807084-5c52b6b3adef',
    'photo-1523275335684-37898b6baf30', 'photo-1587033411391-5d9e51cce126',
  ],
  clothing: [
    'photo-1445205170230-053b83016050', 'photo-1483985988355-763728e1935b',
    'photo-1521572163474-6864f9cf17ab', 'photo-1542291026-7eec264c27ff',
    'photo-1496747611176-843222e1e57c', 'photo-1551028719-00167b16eac5',
  ],
  'home-kitchen': [
    'photo-1556911220-bff31c812dba', 'photo-1556910103-1c02745aae4d',
    'photo-1600585154340-be6161a56a0c', 'photo-1556228720-195a672e8a03',
    'photo-1505693416388-ac5ce068fe85', 'photo-1523413651479-597eb2da0ad6',
  ],
  'sports-outdoors': [
    'photo-1517836357463-d25dfeac3438', 'photo-1538805060514-97d9cc17730c',
    'photo-1518611012118-696072aa579a', 'photo-1552674605-db6ffd4facb5',
    'photo-1461896836934-ffe607ba8211', 'photo-1526506118085-60ce8714f8c5',
  ],
  'books-media': [
    'photo-1512820790803-83ca734da794', 'photo-1495446815901-a7297e633e8d',
    'photo-1524995997946-a1c2e315a42f', 'photo-1511108690759-009324a90311',
    'photo-1507842217343-583bb7270b66', 'photo-1544947950-fa07a98d237f',
  ],
  'beauty-health': [
    'photo-1596462502278-27bfdc403348', 'photo-1556228724-4b7e32a8d2de',
    'photo-1522335789203-aabd1fc54bc9', 'photo-1515377905703-c4788e51af15',
    'photo-1611930022073-b7a4ba5fcccd', 'photo-1608248543803-ba4f8c70ae0b',
  ],
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function imageUrl(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
}

export function getCategoryImage(categorySlug: string): string | undefined {
  return imageSets[categorySlug]?.[0] ? imageUrl(imageSets[categorySlug][0]) : undefined;
}

export function getProductImages(product: ProductInfo, productIndex: number) {
  const images = imageSets[product.categorySlug] || imageSets.electronics;
  const start = hash(`${product.name}:${product.brand}:${product.subcategory}:${productIndex}`) % images.length;

  return Array.from({ length: 4 }, (_, order) => ({
    url: imageUrl(images[(start + order) % images.length]),
    alt: `${product.name} — gallery image ${order + 1}`,
    order,
  }));
}

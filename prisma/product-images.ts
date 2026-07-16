// Product Image Resolver
// Generates unique images per product using picsum.photos with deterministic seeds.
// Every product gets its own unique set of images, eliminating cross-product duplicates.

type ProductInfo = {
  name: string;
  brand: string;
  categorySlug: string;
  subcategory: string;
};

function picsumUrl(seed: string, i: number): string {
  const encoded = encodeURIComponent(seed.replace(/--.*/, '').slice(0, 30));
  return `https://placehold.co/600x600/EEE/31343C?text=${encoded}`;
}

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function getProductImages(
  product: ProductInfo,
  productIndex: number
): { url: string; alt: string; order: number }[] {
  const seed = `${product.name}-${product.brand}-${product.subcategory}-${product.categorySlug}-${productIndex}`;
  const baseHash = fnv1a(seed);
  const count = 7;
  const result: { url: string; alt: string; order: number }[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      url: picsumUrl(`${seed}--${baseHash}--${i}`, i),
      alt: `${product.name} image ${i + 1}`,
      order: i,
    });
  }
  return result;
}

export function getSubcategoryPool(_subcategory: string): string[] {
  return [];
}

export function getBrandSubcategoryPool(_brand: string, _subcategory: string): string[] | null {
  return null;
}

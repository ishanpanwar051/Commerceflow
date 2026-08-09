import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const samples = [
  'Nike Air Zoom Pegasus',
  'Adidas Stan Smith',
  'Classic Black Oxford Shoes',
  'Classic Black Chelsea Boots',
  'Adidas Sport Sandals',
  'Classic Rubber Slippers'
];

console.log('--- Testing 72 Footwear Product Mappings ---');
let pass = 0;
for (const name of samples) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'shoes-footwear' });
  const isPinterest = imgs[0].url.includes('i.pinimg.com');
  console.log(`Product: ${name}`);
  console.log(`  Image: ${imgs[0].url}`);
  console.log(`  Match: ${isPinterest ? '✅ Pinterest' : '❌ Fallback'}`);
  if (isPinterest) pass++;
  console.log('---');
}
console.log(`Summary: ${pass}/${samples.length} sample items verified with Pinterest URLs.`);

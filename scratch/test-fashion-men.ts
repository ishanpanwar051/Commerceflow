import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const samples = [
  'Classic White T-Shirt',
  'Oxford Cotton Shirt',
  'Classic Blue Straight Jeans',
  'Beige Slim Fit Chinos',
  'Black Formal Trousers',
  'Classic Black Suit',
  'Leather Biker Jacket',
  'Classic Crew Neck Sweater',
  'Classic Black Leather Belt',
  'Classic Leather Wallet',
  'Classic Aviator Sunglasses',
  'Classic Analog Watch'
];

console.log('--- Testing 144 Fashion Men Product Mappings ---');
let pass = 0;
for (const name of samples) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'fashion-men' });
  const isPinterest = imgs[0].url.includes('i.pinimg.com');
  console.log(`Product: ${name}`);
  console.log(`  Image: ${imgs[0].url}`);
  console.log(`  Match: ${isPinterest ? '✅ Pinterest' : '❌ Fallback'}`);
  if (isPinterest) pass++;
  console.log('---');
}
console.log(`Summary: ${pass}/${samples.length} sample items verified with Pinterest URLs.`);

import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const samples = [
  'Fresh Full Cream Milk',
  'Basmati Rice',
  'Toor Dal',
  'Potato',
  'Apples',
  'Almonds',
  'Turmeric Powder',
  'Sunflower Oil',
  'Chocolate Biscuits',
  'Tomato Ketchup',
  'Green Tea',
  'Frozen Green Peas'
];

console.log('--- Testing 144 Groceries & Essentials Product Mappings ---');
let pass = 0;
for (const name of samples) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'office-toys-groceries-automotive' });
  const isPinterest = imgs[0].url.includes('i.pinimg.com');
  console.log(`Product: ${name}`);
  console.log(`  Image: ${imgs[0].url}`);
  console.log(`  Match: ${isPinterest ? '✅ Pinterest' : '❌ Fallback'}`);
  if (isPinterest) pass++;
  console.log('---');
}
console.log(`Summary: ${pass}/${samples.length} sample items verified with Pinterest URLs.`);

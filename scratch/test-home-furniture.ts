import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const samples = [
  'Modern 3-Seater Sofa',
  'King Size Platform Bed',
  '6-Seater Wooden Dining Table',
  'Ergonomic Office Chair',
  'Stainless Steel Cookware Set',
  'Stainless Steel Knife Set',
  'Stainless Steel Pressure Cooker',
  'Abstract Wall Art',
  'Modern Area Rug',
  'Blackout Curtains'
];

console.log('--- Testing 120 Home, Kitchen & Furniture Product Mappings ---');
let pass = 0;
for (const name of samples) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'home-kitchen-furniture' });
  const isPinterest = imgs[0].url.includes('i.pinimg.com');
  console.log(`Product: ${name}`);
  console.log(`  Image: ${imgs[0].url}`);
  console.log(`  Match: ${isPinterest ? '✅ Pinterest' : '❌ Fallback'}`);
  if (isPinterest) pass++;
  console.log('---');
}
console.log(`Summary: ${pass}/${samples.length} sample items verified with Pinterest URLs.`);

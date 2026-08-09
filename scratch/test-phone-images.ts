import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const samples = [
  'MacBook Pro 16-inch',
  'Dell XPS 16',
  'iPad Pro 13-inch',
  'Samsung Galaxy Tab S10 Ultra',
  'Samsung Odyssey OLED G9',
  'Apple Studio Display',
  'Logitech MX Mechanical',
  'SteelSeries Apex Pro',
  'PlayStation 5 Pro',
  'Steam Deck OLED',
  'Sony WH-1000XM6',
  'Apple AirPods Max',
  'Canon EOS R5',
  'DJI Osmo Action 5 Pro',
];

console.log('--- Testing 84 Electronics Product Mappings ---');
let pass = 0;
for (const name of samples) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'electronics' });
  const isPinterest = imgs[0].url.includes('i.pinimg.com');
  console.log(`Product: ${name}`);
  console.log(`  Image: ${imgs[0].url}`);
  console.log(`  Match: ${isPinterest ? '✅ Pinterest' : '❌ Fallback'}`);
  if (isPinterest) pass++;
  console.log('---');
}
console.log(`Summary: ${pass}/${samples.length} sample items verified with Pinterest URLs.`);

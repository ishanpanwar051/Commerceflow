import { getProductImages } from '../backend/prisma/product-images';
import { findCatalogProduct } from '../backend/prisma/user-catalog';

const items = [
  'Full Face Motorcycle Helmet',
  'Sport Bike Racing Helmet',
  'Modular Motorcycle Helmet',
  'Leather Motorcycle Riding Jacket',
  'Premium Biker Jacket',
  'Motorcycle Riding Gloves',
  'Motorcycle Riding Boots',
  'Synthetic Engine Oil',
  'Motorcycle Engine Oil Bottle',
  'Car Pressure Washer',
  'Car Cleaning Kit',
];

console.log('--- Testing Automotive Product Mappings ---');
for (const name of items) {
  const match = findCatalogProduct(name);
  const imgs = getProductImages({ name, categorySlug: 'office-toys-groceries-automotive' });
  console.log(`Product: ${name}`);
  console.log(`  Catalog Match: ${match ? match.product.image : 'None'}`);
  console.log(`  Primary Image: ${imgs[0].url}`);
  console.log('---');
}

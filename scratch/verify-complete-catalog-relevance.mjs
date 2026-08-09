import { USER_CATALOG } from '../backend/prisma/user-catalog.js';

console.log('=== GLOBAL PRODUCT IMAGE RELEVANCE & DUPLICATION AUDIT ===\n');

const imageToProducts = {};
let totalProds = 0;

for (const cat of USER_CATALOG) {
  for (const p of cat.products) {
    totalProds++;
    if (!imageToProducts[p.image]) {
      imageToProducts[p.image] = [];
    }
    imageToProducts[p.image].push({ cat: cat.name, name: p.name });
  }
}

console.log(`Total Categories: ${USER_CATALOG.length}`);
console.log(`Total Products: ${totalProds}`);
console.log(`Unique Product Image URLs: ${Object.keys(imageToProducts).length}`);

// Check for cross-category sharing
let crossCategoryCollisions = 0;
for (const [url, list] of Object.entries(imageToProducts)) {
  const categoriesUsedIn = new Set(list.map(item => item.cat));
  if (categoriesUsedIn.size > 1) {
    crossCategoryCollisions++;
    console.log(`⚠️  Cross-Category Collision on URL (${url}):`);
    list.forEach(item => console.log(`      - [${item.cat}] ${item.name}`));
  }
}

if (crossCategoryCollisions === 0) {
  console.log('🎉 PERFECT! 0 Cross-Category Image Collisions found!');
} else {
  console.log(`❌ Found ${crossCategoryCollisions} cross-category image collisions.`);
}

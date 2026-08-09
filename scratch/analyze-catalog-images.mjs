import { USER_CATALOG } from '../backend/prisma/user-catalog.js';
import fs from 'fs';

console.log('=== USER CATALOG ANALYSIS ===\n');

const urlCount = {};
const categoryStats = {};
let totalProducts = 0;

for (const cat of USER_CATALOG) {
  categoryStats[cat.name] = { count: cat.products.length, duplicates: 0 };
  for (const p of cat.products) {
    totalProducts++;
    urlCount[p.image] = (urlCount[p.image] || 0) + 1;
  }
}

const duplicates = Object.entries(urlCount).filter(([url, count]) => count > 1);

console.log(`Total Categories: ${USER_CATALOG.length}`);
console.log(`Total Products: ${totalProducts}`);
console.log(`Unique Image URLs: ${Object.keys(urlCount).length}`);
console.log(`Duplicated Image URLs (>1 use): ${duplicates.length}\n`);

console.log('Category Product Counts:');
for (const [cat, stats] of Object.entries(categoryStats)) {
  console.log(`  - ${cat}: ${stats.count} products`);
}

console.log('\nTop Duplicated Images:');
duplicates.sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([url, count]) => {
  console.log(`  - Used ${count} times: ${url}`);
});

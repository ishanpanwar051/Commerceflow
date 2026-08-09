import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
const content = fs.readFileSync(catalogPath, 'utf8');

// Match category blocks
const catRegex = /name:\s*'([^']+)',\s*slug:\s*'([^']+)',[\s\S]*?products:\s*\[([\s\S]*?)\]\s*\},/g;

let match;
let totalProducts = 0;
const catalogData = [];

while ((match = catRegex.exec(content)) !== null) {
  const catName = match[1];
  const catSlug = match[2];
  const prodBlock = match[3];

  const pRegex = /name:\s*'([^']+)',\s*image:\s*'([^']+)'/g;
  let pMatch;
  const products = [];
  while ((pMatch = pRegex.exec(prodBlock)) !== null) {
    products.push({ name: pMatch[1], image: pMatch[2] });
    totalProducts++;
  }
  catalogData.push({ name: catName, slug: catSlug, count: products.length, products });
}

console.log(`=== CATALOG DUMP ===`);
console.log(`Total Categories: ${catalogData.length}`);
console.log(`Total Products: ${totalProducts}`);
catalogData.forEach(c => console.log(`  - ${c.name} (${c.slug}): ${c.count} items`));

import fs from 'fs';
import path from 'path';

const EXACT_FIXES_3 = {
  'Ankle Boots': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
  'Memory Foam Slippers': 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
};

const catalogPath = path.resolve('backend/prisma/user-catalog.ts');
let catalogText = fs.readFileSync(catalogPath, 'utf8');

for (const [productName, newUrl] of Object.entries(EXACT_FIXES_3)) {
  const escName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`{\\s*name:\\s*'${escName}',\\s*image:\\s*'[^']+'\\s*}`, 'g');
  if (regex.test(catalogText)) {
    catalogText = catalogText.replace(regex, `{ name: '${productName}', image: '${newUrl}' }`);
  }
}

fs.writeFileSync(catalogPath, catalogText, 'utf8');
console.log('✓ Applied single last collision fix!');

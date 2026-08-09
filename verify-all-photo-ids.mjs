import fetch from 'node-fetch';
import { readFileSync } from 'fs';

const fileContent = readFileSync('./backend/prisma/product-images.ts', 'utf-8');

// Match photo-xxxxxxxxxxxx
const matches = fileContent.match(/photo-[a-zA-Z0-9-]+/g) || [];
const uniquePhotoIds = Array.from(new Set(matches));

console.log(`Found ${uniquePhotoIds.length} unique Unsplash photo IDs in product-images.ts. Testing URLs...\n`);

async function testPhotos() {
  const broken = [];
  const valid = [];

  for (const id of uniquePhotoIds) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 200) {
        valid.push(id);
      } else {
        console.warn(`❌ BROKEN ID (${res.status}): ${id}`);
        broken.push(id);
      }
    } catch (err) {
      console.warn(`❌ ERROR FETCHING: ${id}`, err.message);
      broken.push(id);
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`✅ Valid (200 OK): ${valid.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  if (broken.length > 0) {
    console.log(`Broken IDs:`, broken);
  }
}

testPhotos();

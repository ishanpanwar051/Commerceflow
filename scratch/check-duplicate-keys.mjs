import fs from 'fs';

const content = fs.readFileSync('backend/prisma/product-images.ts', 'utf-8');
const lines = content.split('\n');

const seen = new Map();
lines.forEach((line, idx) => {
  const match = line.match(/^\s*['"]?([a-zA-Z0-9_\-\s]+)['"]?\s*:/);
  if (match) {
    const key = match[1].trim().toLowerCase();
    if (seen.has(key)) {
      console.log(`Duplicate key "${key}" at line ${idx + 1} (first seen at line ${seen.get(key)})`);
    } else {
      seen.set(key, idx + 1);
    }
  }
});

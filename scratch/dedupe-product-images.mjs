import fs from 'fs';

const filePath = 'backend/prisma/product-images.ts';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const seenInObject = new Set();
let inObject = false;
let objectBraceDepth = 0;

const cleanedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('const USER_CUSTOM_PRODUCT_IMAGES') || line.includes('const imagePools')) {
    inObject = true;
  }

  if (inObject) {
    const keyMatch = line.match(/^\s*['"]?([a-zA-Z0-9_\-\s]+)['"]?\s*:/);
    if (keyMatch) {
      const key = keyMatch[1].trim().toLowerCase();
      if (seenInObject.has(key)) {
        console.log(`Removing duplicate key "${key}" at line ${i + 1}`);
        continue; // Skip duplicate key line
      } else {
        seenInObject.add(key);
      }
    }
  }

  cleanedLines.push(line);
}

fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf-8');
console.log('Successfully deduped backend/prisma/product-images.ts!');

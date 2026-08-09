import fs from 'fs';
import path from 'path';

const filePath = path.resolve('backend/prisma/product-images.ts');
let content = fs.readFileSync(filePath, 'utf8');

const marker = 'const USER_CUSTOM_PRODUCT_IMAGES: Record<string, string> = {';
const startIndex = content.indexOf(marker);
if (startIndex === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const objStart = startIndex + marker.length;
const objEnd = content.indexOf('\n};\n', objStart);
if (objEnd === -1) {
  console.error('Object end not found!');
  process.exit(1);
}

const rawEntries = content.substring(objStart, objEnd);
const lines = rawEntries.split('\n');

const dict = {};
const comments = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.length === 0) {
    continue;
  }
  const match = /'([^']+)':\s*'([^']+)'/.exec(trimmed);
  if (match) {
    const key = match[1];
    const val = match[2];
    // Keep first or last definition
    dict[key] = val;
  }
}

const cleanedEntries = Object.entries(dict)
  .map(([k, v]) => `  '${k.replace(/'/g, "\\'")}': '${v}',`)
  .join('\n');

const newContent = content.substring(0, objStart) + '\n' + cleanedEntries + '\n' + content.substring(objEnd);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`✓ Deduplicated USER_CUSTOM_PRODUCT_IMAGES: ${Object.keys(dict).length} unique entries.`);

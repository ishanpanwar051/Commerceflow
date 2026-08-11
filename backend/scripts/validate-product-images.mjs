#!/usr/bin/env node
/**
 * IMAGE AUDIT — read-only diagnostic for product image integrity.
 *
 * Usage (from backend/):
 *   $env:DATABASE_URL="<connection-string>"; node scripts/validate-product-images.mjs
 *
 * Reports:
 *   - total products / products with images / missing images
 *   - duplicate image URLs shared by DIFFERENT products
 *   - invalid / empty / placeholder URLs
 *   - any product using a known iPhone-17-Pro-Max image URL
 *   - per-image usage count (top offenders)
 *
 * Never writes to the database.
 */
import { createRequire } from 'node:module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Known "iPhone 17 Pro Max" image URLs that were historically reused everywhere.
const IPHONE_URLS = [
  'https://i.pinimg.com/736x/90/95/2e/90952e9d35a04edbd67eb8eed0f72635.jpg',
  'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg',
];

const PLACEHOLDER_MARKERS = ['picsum.photos', 'unsplash.com', 'placeholder', 'example.com'];

async function main() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: { select: { name: true, slug: true } }, images: true },
    orderBy: { name: 'asc' },
  });

  console.log('==============================================================');
  console.log('IMAGE AUDIT REPORT');
  console.log('==============================================================');
  console.log(`Total products: ${products.length}`);

  const urlToProducts = new Map();
  let missing = 0;
  let invalid = 0;
  let iphoneMisuse = 0;
  let placeholder = 0;
  let valid = 0;

  for (const p of products) {
    const imgs = (p.images || []).map((i) => i.url);
    if (imgs.length === 0) {
      missing++;
      console.log(`  [MISSING] ${p.name} (${p.category?.name || '?'}) - no images`);
      continue;
    }
    const url = imgs[0];
    if (!url || !url.startsWith('http')) {
      invalid++;
      console.log(`  [INVALID] ${p.name} - ${url || '(empty)'}`);
      continue;
    }
    if (PLACEHOLDER_MARKERS.some((m) => url.includes(m))) {
      placeholder++;
      console.log(`  [PLACEHOLDER] ${p.name} - ${url.slice(0, 80)}`);
      continue;
    }
    if (IPHONE_URLS.some((u) => url.includes(u) || url === u)) {
      iphoneMisuse++;
      console.log(`  [IPHONE-MISUSE] ${p.name} (${p.category?.name || '?'}) - ${url.slice(0, 80)}`);
    }
    valid++;
    if (!urlToProducts.has(url)) urlToProducts.set(url, []);
    urlToProducts.get(url).push(p.name);
  }

  console.log('--------------------------------------------------------------');
  console.log(`Valid (http) images:        ${valid}`);
  console.log(`Missing images:             ${missing}`);
  console.log(`Invalid/empty URLs:         ${invalid}`);
  console.log(`Placeholder/generic URLs:   ${placeholder}`);
  console.log(`iPhone-image misuse:        ${iphoneMisuse}`);
  console.log('--------------------------------------------------------------');

  const dupes = [...urlToProducts.entries()]
    .filter(([, prods]) => prods.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  console.log(`Duplicate image URLs (used by >1 product): ${dupes.length}`);
  for (const [url, prods] of dupes.slice(0, 40)) {
    console.log(`  x${prods.length} ${url.slice(0, 90)}`);
    console.log(`       ${prods.slice(0, 6).join(' | ')}${prods.length > 6 ? ` (+${prods.length - 6} more)` : ''}`);
  }

  console.log('==============================================================');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});

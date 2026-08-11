/**
 * Clean Production Product Images — MANUAL, ONE-TIME TOOL.
 *
 * Usage (explicit, from your machine):
 *   $env:DATABASE_URL="<Render Postgres External URL>"; npx tsx backend/scripts/clean-production-images.ts
 *
 * This is NOT wired into any build, startup, or deploy command. It only runs
 * when you invoke it directly.
 *
 * Behaviour (strict, deterministic — NO random/pool photography):
 *  - A product is "bad" if it has no images or any image is a picsum/Unsplash
 *    placeholder URL.
 *  - If the product name matches one of the site-owner's VERIFIED images
 *    (CUSTOM_PRODUCT_IMAGES), that exact URL is used.
 *  - Otherwise the product gets ONE deterministic local placeholder:
 *    /images/placeholder-product.png
 *  - NEVER touches products whose images are already valid (non-placeholder).
 *  - Does NOT use the subcategory image pools or catalog images: those are
 *    not verified per-product and would re-introduce wrong photography.
 *
 * Dry run first:
 *   $env:DRY_RUN="1"; $env:DATABASE_URL="..."; npx tsx backend/scripts/clean-production-images.ts
 */

import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { CUSTOM_PRODUCT_IMAGES } from '../prisma/product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const PLACEHOLDER_URL = '/images/placeholder-product.png';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});
const prisma: any = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true; // null/missing counts as needing a value
  return url.includes('picsum.photos') || url.includes('unsplash.com');
}

function findCustomImage(name: string): string | null {
  const lower = (name || '').toLowerCase();
  for (const [key, url] of Object.entries(CUSTOM_PRODUCT_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: { select: { id: true, name: true, slug: true } }, images: true },
    orderBy: { createdAt: 'asc' },
  });

  const fixed: Array<{ name: string; old: string; next: string }> = [];
  let alreadyGood = 0;
  const dryRun = process.env.DRY_RUN === '1';

  for (const p of products) {
    const bad = p.images.length === 0 || p.images.some((i: any) => isPlaceholderUrl(i.url));
    if (!bad) {
      alreadyGood++;
      continue;
    }

    const custom = findCustomImage(p.name);
    const nextUrl = custom || PLACEHOLDER_URL;
    const oldUrl = p.images[0]?.url || '(none)';

    if (!dryRun) {
      await prisma.productImage.deleteMany({ where: { productId: p.id } });
      await prisma.productImage.createMany({
        data: {
          productId: p.id,
          url: nextUrl,
          alt: p.name,
          order: 0,
        },
      });
    }

    fixed.push({ name: p.name, old: oldUrl, next: nextUrl });
  }

  const customCount = fixed.filter((f) => f.next.startsWith('http')).length;
  const placeholderCount = fixed.filter((f) => f.next === PLACEHOLDER_URL).length;

  console.log(`\n${dryRun ? 'DRY RUN (no writes)' : 'RESULT'}:`);
  console.log(`Total products: ${products.length}`);
  console.log(`Already correct: ${alreadyGood}`);
  console.log(`Fixed: ${fixed.length}`);
  console.log(`  -> verified custom image: ${customCount}`);
  console.log(`  -> local placeholder:     ${placeholderCount}`);
  if (fixed.length > 0) {
    console.log('\n--- Fixed ---');
    for (const f of fixed) console.log(`  ${f.name}\n    old: ${f.old}\n    new: ${f.next}`);
  }

  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});

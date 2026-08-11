import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getProductImages, getCategoryImage, resetUsedImages } from '../prisma/product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

/**
 * PERMANENT image repair — overwrites every existing product image with the
 * corrected deterministic image (fixed getProductImages logic), and refreshes
 * category images.
 *
 * Unlike the original update-images.ts, this REPLACES images so that images
 * already persisted with the buggy iPhone-17-Pro-Max URL are corrected in
 * place. It never touches product/order/user data.
 *
 * Idempotent: safe to re-run.
 *
 * Usage (from backend/):
 *   $env:DATABASE_URL="<connection-string>"; node dist/fix-product-images.mjs
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // 1. Category images
  const categories = await prisma.category.findMany({ where: { deletedAt: null } });
  let catUpdated = 0;
  for (const c of categories) {
    const img = getCategoryImage(c.slug);
    if (!img) continue;
    await prisma.category.update({ where: { id: c.id }, data: { image: img } });
    catUpdated++;
  }
  console.log(`Category images updated: ${catUpdated}`);

  // 2. Product images — overwrite all existing images
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { name: true, slug: true } },
      images: { select: { id: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Products loaded: ${products.length}`);

  resetUsedImages(products.map((p: any) => ({ name: p.name })));

  const rows: { productId: string; url: string; alt: string; order: number }[] = [];
  const imageIds: string[] = [];

  for (const p of products) {
    const categorySlug = p.category?.slug || 'general';
    const images = getProductImages({
      name: p.name,
      brand: p.brand || 'CommerceFlow',
      categorySlug,
      subcategory: p.category?.name || '',
    });
    if (!images || images.length === 0) {
      console.warn(`  skip ${p.name}: no image produced`);
      continue;
    }
    for (const img of images) rows.push({ productId: p.id, url: img.url, alt: img.alt, order: img.order });
    for (const im of p.images || []) imageIds.push(im.id);
  }

  // Delete old (buggy) images, then insert corrected ones in batches.
  if (imageIds.length > 0) {
    const res = await prisma.productImage.deleteMany({ where: { id: { in: imageIds } } });
    console.log(`Deleted old product images: ${res.count}`);
  }

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    await prisma.productImage.createMany({ data: rows.slice(i, i + BATCH) });
  }
  console.log(`Created corrected product images: ${rows.length}`);

  console.log('Image repair complete.');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});

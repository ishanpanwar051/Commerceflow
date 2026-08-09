import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getProductImages, getCategoryImage, resetUsedImages } from './product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

let prisma: any;

function getPrismaInstance() {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required to run the image sync');
    }
    const syncPool = new Pool({ connectionString: databaseUrl });
    const syncAdapter = new PrismaPg(syncPool);
    prisma = new PrismaClient({ adapter: syncAdapter } as any);
  }
  return prisma;
}

/**
 * One-time / deploy-time image sync.
 *
 * Idempotent: on every run it guarantees
 *  - every category has a category-appropriate image,
 *  - every product has exactly 1 image sourced from its subcategory's verified
 *    16-image Unsplash pool, so product images are unique across the catalog.
 *
 * Batched (not per-row awaits) so it completes well within Render's startup
 * grace period even with a large catalog.
 */
async function main() {
  const prisma = getPrismaInstance();
  // 1. Category images
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  let catUpdated = 0;
  for (const c of categories) {
    const img = getCategoryImage(c.slug);
    if (!img) continue;
    await prisma.category.update({ where: { id: c.id }, data: { image: img } });
    catUpdated++;
  }
  console.log(`\n✓ Updated ${catUpdated} category images.`);

  // 2. Product images — delete + recreate exactly 1 image per product from its
  //    subcategory pool (unique per product, no cross-category reuse).
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true, parentId: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Pre-seed the uniqueness tracker with catalog product images
  resetUsedImages(products.map((p: any) => ({ name: p.name })));

  const imageRows: {
    productId: string;
    url: string;
    alt: string;
    order: number;
  }[] = [];

  let skipped = 0;
  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    const category = p.category;
    const categorySlug = category?.slug || 'general';

    let newImages;
    try {
      newImages = getProductImages(
        { 
          name: p.name, 
          brand: p.brand || 'CommerceFlow', 
          categorySlug,
          subcategory: category?.name || ''
        },
        i
      );
    } catch (err) {
      console.warn(`  ! skipping ${p.id} (${p.name}): ${(err as Error).message}`);
      skipped += 1;
      continue;
    }

    for (const img of newImages) {
      imageRows.push({
        productId: p.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
      });
    }
  }

  const totalProducts = products.length;
  const totalRows = imageRows.length;

  if (totalRows === 0) {
    console.log('  ! no product image rows to write');
    await prisma.$disconnect();
    return;
  }

  await prisma.productImage.deleteMany({
    where: { productId: { in: products.map((p: any) => p.id) } },
  });

  const BATCH = 500;
  for (let i = 0; i < imageRows.length; i += BATCH) {
    await prisma.productImage.createMany({
      data: imageRows.slice(i, i + BATCH),
    });
    console.log(`  ...${Math.min(i + BATCH, imageRows.length)}/${totalRows} image rows`);
  }

  console.log(`✓ Synced images for ${totalProducts} products (1 each, all unique).`);
  await prisma.$disconnect();
}

if (process.argv[1]?.includes('update-images')) {
  main().catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
}

export default main;

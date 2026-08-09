import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getProductImages, getCategoryImage } from './product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required to run the image sync');
  process.exit(1);
}
const syncPool = new Pool({ connectionString: databaseUrl });
const syncAdapter = new PrismaPg(syncPool);

const prisma = new PrismaClient({ adapter: syncAdapter } as any);

/**
 * One-time / deploy-time image sync.
 *
 * Idempotent: on every run it guarantees
 *  - every category has a category-appropriate image,
 *  - every product has exactly 4 images with a UNIQUE primary image
 *    (primaries are derived from the product's stable position in the catalog,
 *    so re-runs produce identical results and never shuffle existing data).
 *
 * Batched (not per-row awaits) so it completes well within Render's startup
 * grace period even with a large catalog.
 */
async function main() {
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

  // 2. Product images — delete + recreate exactly 4 per product so the primary
  //    (order 0) is unique and gallery images are evenly distributed.
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true, parentId: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const catById = new Map(categories.map((c) => [c.id, c]));

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
    const parent = category?.parentId ? catById.get(category.parentId) : undefined;
    const categorySlug = parent?.slug || category?.slug || 'general';

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
    where: { productId: { in: products.map((p) => p.id) } },
  });

  const BATCH = 500;
  for (let i = 0; i < imageRows.length; i += BATCH) {
    await prisma.productImage.createMany({
      data: imageRows.slice(i, i + BATCH),
    });
    console.log(`  ...${Math.min(i + BATCH, imageRows.length)}/${totalRows} image rows`);
  }

  console.log(`✓ Synced images for ${totalProducts} products (4 each, unique primaries).`);
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

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
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });

  let updated = 0;
  for (const p of products) {
    const parentCategory = p.category.parentId
      ? await prisma.category.findUnique({ where: { id: p.category.parentId } })
      : null;
    const categorySlug = parentCategory?.slug || p.category.slug;

    const newImages = getProductImages(
      { name: p.name, brand: p.brand || 'CommerceFlow', categorySlug },
      updated
    );

    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    await prisma.productImage.createMany({
      data: newImages.map((img) => ({
        productId: p.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
      })),
    });
    updated++;
    if (updated % 100 === 0) console.log(`  ...${updated} products`);
  }

  console.log(`✓ Synced images for ${updated} products (4 each, unique primaries).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

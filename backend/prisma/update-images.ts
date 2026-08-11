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
    const syncPool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    });
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
 *    16-image Pinterest pool, so product images are unique across the catalog.
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

  // 1.5 Clean stale duplicate image rows
  await prisma.productImage.deleteMany({
    where: {
      url: { contains: '90952e9d35a04edbd67eb8eed0f72635' }
    }
  });

  // 2. Product images — ONLY fill missing images for products without images.
  // Never delete or overwrite existing product images.
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      images: { select: { id: true, url: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const productsWithoutImages = products.filter((p: any) => !p.images || p.images.length === 0);
  console.log(`\n📊 Total products: ${products.length}, Products missing images: ${productsWithoutImages.length}`);

  if (productsWithoutImages.length === 0) {
    console.log('✓ All products already have persistent images. Skipping image creation.');
    await prisma.$disconnect();
    return;
  }

  // Pre-seed the uniqueness tracker with catalog product images
  resetUsedImages(products.map((p: any) => ({ name: p.name })));

  const imageRows: {
    productId: string;
    url: string;
    alt: string;
    order: number;
  }[] = [];

  for (let i = 0; i < productsWithoutImages.length; i += 1) {
    const p = productsWithoutImages[i];
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

  if (imageRows.length > 0) {
    const BATCH = 500;
    for (let i = 0; i < imageRows.length; i += BATCH) {
      await prisma.productImage.createMany({
        data: imageRows.slice(i, i + BATCH),
      });
    }
    console.log(`✓ Created images for ${productsWithoutImages.length} previously missing products.`);
  }

  console.log(`✓ Image sync complete. Total catalog products verified: ${products.length}.`);
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

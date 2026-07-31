import { PrismaClient } from '@prisma/client';
import { getProductImages } from './product-images';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { order: 'asc' } } },
  });

  let updated = 0;

  for (const p of products) {
    const parentCategory = p.category.parentId
      ? await prisma.category.findUnique({ where: { id: p.category.parentId } })
      : null;

    const categorySlug = parentCategory?.slug || p.category.slug;
    const subcategory = p.category.parentId ? p.category.name : (parentCategory?.name || p.category.name);

    const newImages = getProductImages(
      {
        name: p.name,
        brand: p.brand || 'Generic',
        categorySlug,
        subcategory,
      },
      updated
    );

    const existingIds = p.images.map((img) => img.id);

    for (let i = 0; i < newImages.length; i++) {
      if (existingIds[i]) {
        await prisma.productImage.update({
          where: { id: existingIds[i] },
          data: { url: newImages[i].url, alt: newImages[i].alt, order: newImages[i].order },
        });
      } else {
        await prisma.productImage.create({
          data: { url: newImages[i].url, alt: newImages[i].alt, order: newImages[i].order, productId: p.id },
        });
      }
    }

    if (newImages.length < p.images.length) {
      const toDelete = existingIds.slice(newImages.length);
      await prisma.productImage.deleteMany({ where: { id: { in: toDelete } } });
    }

    updated++;
    if (updated % 20 === 0) {
      console.log(`Updated ${updated} products...`);
    }
  }

  console.log(`\n✅ Updated ${updated} product images to use correct product-matching photos.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });

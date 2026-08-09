import { getPrisma, disconnectDatabase } from '../src/config/database';
import { getProductImages, isBlockedImageUrl } from './product-images';

const prisma = getPrisma();

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: { select: { slug: true, name: true } }, images: { orderBy: { order: 'asc' } } },
  });

  let repaired = 0;
  let skipped = 0;

  for (const product of products) {
    const primary = product.images[0];
    if (primary?.url && !isBlockedImageUrl(primary.url)) {
      skipped++;
      continue;
    }

    const [image] = getProductImages({
      name: product.name,
      brand: product.brand ?? undefined,
      categorySlug: product.category.slug,
      subcategory: product.category.name,
    });

    if (!image?.url) continue;

    if (primary) {
      await prisma.productImage.update({ where: { id: primary.id }, data: { url: image.url, alt: product.name, order: 0 } });
    } else {
      await prisma.productImage.create({ data: { productId: product.id, url: image.url, alt: product.name, order: 0 } });
    }
    repaired++;
  }

  console.log(JSON.stringify({ checked: products.length, repaired, alreadyValid: skipped }, null, 2));
}

main().catch((error) => {
  console.error('[image-repair]', error);
  process.exitCode = 1;
}).finally(() => disconnectDatabase());

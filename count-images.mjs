import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg('postgresql://postgres:postgres@127.0.0.1:5432/commerceflow_dev');
const p = new PrismaClient({ adapter });

async function count() {
  const categoryCount = await p.category.count({ where: { image: { not: null } } });
  const productImageCount = await p.productImage.count();
  const productCount = await p.product.count();

  console.log(`=== DATABASE IMAGE METRICS ===`);
  console.log(`📁 Category Images: ${categoryCount}`);
  console.log(`📦 Total Product Gallery Images: ${productImageCount}`);
  console.log(`🏷️ Total Products: ${productCount}`);
  console.log(`📸 Images Per Product: ${productImageCount / productCount} images/product`);
  console.log(`🖼️ TOTAL COMBINED IMAGES: ${categoryCount + productImageCount}`);

  await p.$disconnect();
}

count().catch(console.error);

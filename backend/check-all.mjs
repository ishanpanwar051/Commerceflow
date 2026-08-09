import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg('postgresql://postgres:postgres@127.0.0.1:5432/commerceflow_dev');
const p = new PrismaClient({ adapter });

const categoryCount = await p.category.count({ where: { image: { not: null } } });
const productImageCount = await p.productImage.count();
const productCount = await p.product.count();

console.log(`=== DATABASE IMAGE METRICS ===`);
console.log(`📁 Category Banner & Tile Images: ${categoryCount}`);
console.log(`📦 Product Gallery Images:        ${productImageCount}`);
console.log(`🏷️ Total Products Seeded:         ${productCount}`);
console.log(`📸 Images Per Product:            ${productImageCount / productCount} gallery views`);
console.log(`🖼️ TOTAL ACTIVE IMAGES:           ${categoryCount + productImageCount}`);

await p.$disconnect();

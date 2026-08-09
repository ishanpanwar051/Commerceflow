import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg('postgresql://postgres:postgres@127.0.0.1:5432/commerceflow_dev');
const p = new PrismaClient({ adapter });
const include = {
  images: { orderBy: { order: 'asc' }, take: 2 },
  inventory: { select: { stock: true, reservedStock: true, lowStockThreshold: true } },
  category: true,
  _count: { select: { reviews: { where: { deletedAt: null, isActive: true } } } },
};
const products = await p.product.findMany({ where: { deletedAt: null, isActive: true }, take: 5, include, orderBy: { createdAt: 'desc' } });
console.log('FOUND', products.length);
products.forEach(prod => {
  console.log(`Product: "${prod.name}" | Category: "${prod.category?.name}"`);
  console.log('Images:', prod.images.map(img => ({ url: img.url, order: img.order })));
});
const total = await p.product.count({ where: { deletedAt: null, isActive: true } });
console.log('TOTAL', total);
await p.$disconnect();

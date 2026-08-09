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
const beautyCat = await p.category.findFirst({ where: { slug: 'beauty' } });
console.log('Beauty Category:', beautyCat?.name, 'ID:', beautyCat?.id);
const subCats = await p.category.findMany({ where: { parentId: beautyCat.id } });
console.log('Subcategories:', subCats.map(c => c.name));
const subCatIds = subCats.map(c => c.id);
const beautyProducts = await p.product.findMany({ where: { categoryId: { in: [beautyCat.id, ...subCatIds] } } });
console.log('Beauty products found:', beautyProducts.length);
beautyProducts.forEach(prod => console.log(' -', prod.name));
await p.$disconnect();

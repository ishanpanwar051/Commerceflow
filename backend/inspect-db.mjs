import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const url = process.env.DATABASE_URL;
  let prisma;
  if (url) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    prisma = new PrismaClient({ datasources: { db: { url: 'file:./prisma/dev.db' } } });
  }

  const cats = await prisma.category.findMany({ where: { parentId: null }, include: { _count: { select: { products: true, children: true } } } });
  console.log('=== PARENT CATEGORIES ===');
  for (const c of cats) {
    console.log(`${c.name} (slug=${c.slug}) products=${c._count.products} children=${c._count.children}`);
  }

  const prods = await prisma.product.findMany({ include: { images: true, category: true } });
  console.log(`\n=== TOTAL PRODUCTS: ${prods.length} ===`);
  for (const p of prods) {
    const img = p.images?.[0]?.url || 'NO-IMAGE';
    console.log(`[${p.category?.name}] ${p.name} | img=${img}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

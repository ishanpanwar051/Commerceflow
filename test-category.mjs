import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  const cat = await prisma.category.findFirst({ where: { slug: 'beauty' } });
  console.log('Beauty Category:', cat?.id, cat?.name);

  const children = await prisma.category.findMany({ where: { parentId: cat.id } });
  console.log('Subcategories:', children.map(c => c.name));

  const subIds = children.map(c => c.id);
  const products = await prisma.product.findMany({ where: { categoryId: { in: [cat.id, ...subIds] } } });
  console.log('Total Products for Beauty:', products.length);
  products.forEach(p => console.log(' -', p.name));
  await prisma.$disconnect();
  process.exit(0);
}

test().catch(console.error);

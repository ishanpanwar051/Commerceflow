/**
 * Reduces the catalog to 10 main (top-level) categories.
 *
 * Changes:
 *  - Creates a top-level "Fashion" parent and moves "Fashion Men" and
 *    "Fashion Women" under it.
 *  - Renames "Sports" to "Sports & Fitness" and moves "Fitness" under it.
 *  - Deactivates the Automotive, Pet Supplies and Office Supplies subtrees
 *    (soft-delete via isActive=false, so nothing is hard-deleted).
 *
 * Usage (from repo root, pointing DATABASE_URL at the target database):
 *   $env:DATABASE_URL="<connection-string>"; pnpm dlx tsx backend/prisma/restructure-categories.ts
 */
import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required to run this script');
  process.exit(1);
}
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

async function main() {
  const all = await prisma.category.findMany({ where: { deletedAt: null } });
  const bySlug = (slug: string) => all.find((c) => c.slug === slug);

  const fashionMen = bySlug('fashion-men');
  const fashionWomen = bySlug('fashion-women');
  const sports = bySlug('sports');
  const fitness = bySlug('fitness');
  if (!fashionMen || !fashionWomen || !sports || !fitness) {
    throw new Error('Expected categories (fashion-men, fashion-women, sports, fitness) not all found');
  }

  let fashion = bySlug('fashion');
  if (!fashion) {
    fashion = await prisma.category.create({
      data: { name: 'Fashion', slug: 'fashion', description: 'Men, women and kids fashion from top brands' },
    });
    console.log('  Created top-level "Fashion"');
  }

  await prisma.category.update({ where: { id: fashionMen.id }, data: { parentId: fashion.id } });
  await prisma.category.update({ where: { id: fashionWomen.id }, data: { parentId: fashion.id } });
  console.log('  Moved Fashion Men + Fashion Women under Fashion');

  await prisma.category.update({ where: { id: sports.id }, data: { name: 'Sports & Fitness' } });
  await prisma.category.update({ where: { id: fitness.id }, data: { parentId: sports.id } });
  console.log('  Renamed Sports -> Sports & Fitness, moved Fitness under it');

  const removed = ['automotive', 'pet-supplies', 'office-supplies'];
  for (const slug of removed) {
    const root = bySlug(slug);
    if (!root) continue;
    const subtree: string[] = [root.id];
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of all) {
        if (c.parentId && subtree.includes(c.parentId) && !subtree.includes(c.id)) {
          subtree.push(c.id);
          changed = true;
        }
      }
    }
    await prisma.category.updateMany({
      where: { id: { in: subtree } },
      data: { isActive: false },
    });
    console.log(`  Deactivated ${slug} subtree (${subtree.length} categories)`);
  }

  const top = await prisma.category.findMany({
    where: { parentId: null, deletedAt: null, isActive: true },
    orderBy: { name: 'asc' },
  });
  console.log(`\nTop-level categories now (${top.length}):`);
  for (const t of top) {
    const children = await prisma.category.count({ where: { parentId: t.id, isActive: true, deletedAt: null } });
    console.log(`  - ${t.name} [${t.slug}] (${children} children)`);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
    process.exit(1);
  });

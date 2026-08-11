/**
 * Auto-Fix Database — MANUAL MAINTENANCE TOOL ONLY.
 * 
 * This script is intentionally NOT wired into Render's build or start command.
 * A server restart must NEVER mutate product data.
 * 
 * To run it manually (one-time, explicit):
 *   DATABASE_URL=... node ./backend/dist/auto-fix-database.mjs
 * 
 * It only seeds when the database is completely empty. It never rewrites
 * existing product data.
 */

import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

import runSeed from '../prisma/seed';

async function main() {
  console.log('🔧 Auto-Fix Database Starting...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('⚠️  No DATABASE_URL, skipping auto-fix');
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    // Check if database needs seeding
    const productCount = await prisma.product.count();
    
    // Only re-seed when the database is completely empty. Never wipe an
    // existing catalog based on a fixed product-count expectation, since the
    // production catalog can legitimately differ from the seed catalog.
    if (productCount === 0) {
      console.log(`📦 Database is empty. Running seed...`);
      await runSeed();
      console.log('✅ Database seeded successfully');
    } else {
      console.log(`📊 Database has ${productCount} products. Nothing to do.`);
    }
    
    console.log('🎉 Auto-fix complete!');
  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    console.log('⚠️  Continuing with server startup anyway...');
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    try {
      await pool.end();
    } catch (e) {
      // Ignore pool end errors
    }
  }
}

// Only run when explicitly invoked (manual maintenance). Never when imported.
if (process.argv[1] && process.argv[1].includes('auto-fix-database')) {
  main().catch((error) => {
    console.error('Fatal error in auto-fix:', error);
    process.exit(0); // Don't fail deployment
  });
}

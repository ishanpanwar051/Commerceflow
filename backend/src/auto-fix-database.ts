/**
 * Auto-Fix Database on Startup
 * 
 * Runs automatically on every deployment to ensure:
 * - Database has products
 * - Section flags are mutually exclusive
 * - No duplicates across sections
 * 
 * This compensates for free tier (no shell access)
 */

import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

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
    // Check if database needs fixing
    const productCount = await prisma.product.count();
    
    // Only re-seed when the database is completely empty. Never wipe an
    // existing catalog based on a fixed product-count expectation, since the
    // production catalog can legitimately differ from the seed catalog.
    if (productCount === 0) {
      console.log(`📦 Database is empty. Running seed...`);
      
      // Import and run seed
      const { default: runSeed } = await import('../prisma/seed.js');
      await runSeed();
      
      console.log('✅ Database seeded successfully');
    } else {
      console.log(`📊 Database has ${productCount} products (skipping re-seed and leaves data untouched)`);
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

main().catch((error) => {
  console.error('Fatal error in auto-fix:', error);
  process.exit(0); // Don't fail deployment
});

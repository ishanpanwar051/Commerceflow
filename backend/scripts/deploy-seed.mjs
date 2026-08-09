#!/usr/bin/env node
/**
 * Deployment Seed Script - SAFE VERSION
 * 
 * Only checks if re-seed needed, doesn't auto-clear database
 * Logs warning if old data detected
 */

import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

async function main() {
  console.log('🔍 Checking database seed status...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('⚠️  DATABASE_URL not set, skipping check');
    process.exit(0);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const productCount = await prisma.product.count();
    
    if (productCount !== 112) {
      console.log(`⚠️  WARNING: Database has ${productCount} products instead of the expected 112! Please run seed manually if needed:`);
      console.log('   Render Shell → cd backend → npx tsx prisma/seed.ts');
    } else {
      const featured = await prisma.product.count({ where: { isFeatured: true } });
      const bestsellers = await prisma.product.count({ where: { isBestSeller: true } });
      const newArrivals = await prisma.product.count({ where: { isNewArrival: true } });

      console.log(`📊 Database Status:`);
      console.log(`   Total Products: ${productCount}`);
      console.log(`   Featured: ${featured}`);
      console.log(`   Bestsellers: ${bestsellers}`);
      console.log(`   New Arrivals: ${newArrivals}`);

      // Check for old overlapping distribution
      if (featured > 25 || newArrivals > 25) {
        console.log('⚠️  WARNING: Old seed distribution detected!');
        console.log('   To apply fixes, run in Render Shell:');
        console.log('   cd backend && npx tsx prisma/seed.ts');
      } else {
        console.log('✅ Database has fixed seed data');
      }
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);

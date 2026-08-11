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
    
    if (productCount === 0) {
      console.log('ℹ️ Database is empty (0 products). Seeding can be run if needed.');
    } else {
      const featured = await prisma.product.count({ where: { isFeatured: true } });
      const bestsellers = await prisma.product.count({ where: { isBestSeller: true } });
      const newArrivals = await prisma.product.count({ where: { isNewArrival: true } });

      console.log(`📊 Database Status:`);
      console.log(`   Total Products: ${productCount}`);
      console.log(`   Featured: ${featured}`);
      console.log(`   Bestsellers: ${bestsellers}`);
      console.log(`   New Arrivals: ${newArrivals}`);
      console.log('✅ Database data verified');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);

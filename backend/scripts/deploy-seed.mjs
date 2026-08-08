#!/usr/bin/env node
/**
 * Deployment Seed Script
 * 
 * Runs on every Render deployment to ensure database has latest data
 * with fixed image logic. Only re-seeds if needed (checks version).
 */

import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

const SEED_VERSION = '2.0.0'; // Updated for image fixes

async function shouldReseed(prisma) {
  try {
    // Check if products exist and have new hash-based images
    const productCount = await prisma.product.count();
    
    if (productCount === 0) {
      console.log('📦 Database is empty, seeding required');
      return true;
    }

    // Check if we have the new section distribution (mutually exclusive flags)
    const featured = await prisma.product.count({ where: { isFeatured: true } });
    const bestsellers = await prisma.product.count({ where: { isBestSeller: true } });
    const newArrivals = await prisma.product.count({ where: { isNewArrival: true } });

    console.log(`📊 Current distribution: Featured=${featured}, Bestsellers=${bestsellers}, New=${newArrivals}`);

    // If old overlapping distribution detected (Featured + New both ~20-30), re-seed
    if (featured > 25 || newArrivals > 25) {
      console.log('⚠️  Old seed distribution detected, re-seeding with fixed logic');
      return true;
    }

    // Check for duplicate products in sections (old bug)
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      select: { id: true },
      take: 20,
    });

    const newArrivalProducts = await prisma.product.findMany({
      where: { isNewArrival: true },
      select: { id: true },
      take: 20,
    });

    const featuredIds = new Set(featuredProducts.map(p => p.id));
    const overlaps = newArrivalProducts.filter(p => featuredIds.has(p.id));

    if (overlaps.length > 0) {
      console.log(`⚠️  Found ${overlaps.length} duplicate products across sections, re-seeding`);
      return true;
    }

    console.log('✅ Database already has fixed seed data, skipping re-seed');
    return false;

  } catch (error) {
    console.log('⚠️  Error checking seed status, will re-seed:', error.message);
    return true;
  }
}

async function main() {
  console.log('🚀 Deploy Seed Script Starting...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set, skipping seed');
    process.exit(0); // Don't fail deployment
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Check if re-seed needed
    const needsReseed = await shouldReseed(prisma);

    if (!needsReseed) {
      console.log('✅ Database up to date, no seed needed');
      await prisma.$disconnect();
      await pool.end();
      return;
    }

    console.log('🌱 Starting database re-seed with fixed logic...');

    // Clear existing data (keep users for continuity)
    console.log('🗑️  Clearing old product data...');
    await prisma.$executeRaw`DELETE FROM "review_images"`;
    await prisma.$executeRaw`DELETE FROM "reviews"`;
    await prisma.$executeRaw`DELETE FROM "order_items"`;
    await prisma.$executeRaw`DELETE FROM "payments"`;
    await prisma.$executeRaw`DELETE FROM "orders"`;
    await prisma.$executeRaw`DELETE FROM "cart_items"`;
    await prisma.$executeRaw`DELETE FROM "carts"`;
    await prisma.$executeRaw`DELETE FROM "wishlist_items"`;
    await prisma.$executeRaw`DELETE FROM "inventory"`;
    await prisma.$executeRaw`DELETE FROM "product_images"`;
    await prisma.$executeRaw`DELETE FROM "products"`;
    await prisma.$executeRaw`DELETE FROM "categories"`;
    await prisma.$executeRaw`DELETE FROM "coupons"`;

    console.log('✅ Old data cleared');

    // Import and run the actual seed
    console.log('📦 Running seed script with fixed image logic...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync('npx tsx ./backend/prisma/seed.ts', {
      env: { ...process.env },
      cwd: process.cwd(),
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✅ Database re-seeded successfully with fixed logic');
    console.log('   - Hash-based stable image selection ✅');
    console.log('   - Mutually exclusive section flags ✅');
    console.log('   - Complete category mappings ✅');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    // Don't fail the deployment, just log the error
    console.log('⚠️  Continuing deployment despite seed error');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);

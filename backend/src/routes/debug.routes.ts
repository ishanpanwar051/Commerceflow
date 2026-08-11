import { Router } from 'express';
import { getPrisma } from '../config/database.js';

const prisma = getPrisma();

const router = Router();

/**
 * DEBUG ENDPOINT - Database Status
 * Shows current database state for troubleshooting
 */
router.get('/db-status', async (req, res) => {
  try {
    const [
      productCount,
      categoryCount,
      featuredCount,
      bestsellerCount,
      newArrivalCount,
      topRatedCount,
      sampleProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { isBestSeller: true } }),
      prisma.product.count({ where: { isNewArrival: true } }),
      prisma.product.count({ where: { isTopRated: true } }),
      prisma.product.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          isFeatured: true,
          isBestSeller: true,
          isNewArrival: true,
          isTopRated: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Check for overlap
    const hasOverlap = sampleProducts.some(p => 
      [p.isFeatured, p.isBestSeller, p.isNewArrival, p.isTopRated].filter(Boolean).length > 1
    );

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        products: productCount,
        categories: categoryCount,
      },
      flags: {
        featured: featuredCount,
        bestsellers: bestsellerCount,
        newArrivals: newArrivalCount,
        topRated: topRatedCount,
      },
      issues: {
        isEmpty: productCount === 0,
        hasOverlap: hasOverlap,
        needsFix: productCount === 0 || hasOverlap,
      },
      sampleProducts: sampleProducts.map(p => ({
        name: p.name,
        flags: {
          featured: p.isFeatured,
          bestseller: p.isBestSeller,
          new: p.isNewArrival,
          topRated: p.isTopRated,
        },
        createdAt: p.createdAt,
      })),
      recommendation: productCount === 0 
        ? 'Database is empty - trigger /api/v1/debug/seed to seed catalog'
        : hasOverlap
        ? 'Products have overlapping flags - auto-fix should correct on next deployment'
        : 'Database looks good!'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * DEBUG ENDPOINT - Trigger Database Seed
 * Allows explicit on-demand seeding of the database
 */
router.all('/seed', async (req, res) => {
  try {
    const { spawn } = await import('node:child_process');
    const { fileURLToPath } = await import('node:url');
    const seedPath = fileURLToPath(new URL('../../seed.mjs', import.meta.url));
    
    console.log(`[debug/seed] Triggering seed script from ${seedPath}`);
    const child = spawn(process.execPath, [seedPath], { stdio: 'inherit' });
    
    child.on('exit', (code) => {
      if (code === 0) {
        res.json({ status: 'success', message: 'Database seeded successfully with 240 verified images' });
      } else {
        res.status(500).json({ status: 'error', message: `Seed exited with code ${code}` });
      }
    });

    child.on('error', (err) => {
      res.status(500).json({ status: 'error', message: err.message });
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;

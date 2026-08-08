import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

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
        ? 'Database is empty - auto-fix should seed on next deployment'
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

export default router;

import "./env";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import { closeQueues } from "./workers/queue";

const rawPort = process.env["PORT"] ?? "4000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  try {
    await connectDatabase();
    
    // Auto-fix database on startup (for free tier without shell access)
    logger.info('🔧 Checking database status...');
    const { getPrisma } = await import('./config/database.js');
    const prisma = getPrisma();
    
    const productCount = await prisma.product.count();
    logger.info(`📊 Found ${productCount} products in database`);
    
    if (productCount === 0 || productCount < 100) {
      logger.info('📦 Incomplete or empty product catalog detected, running seed script...');
      try {
        let runSeed: any;
        try {
          // @ts-ignore
          const seedModule = await import('./seed.mjs');
          runSeed = seedModule.default;
        } catch {
          // @ts-ignore
          const seedModule = await import('../prisma/seed.js');
          runSeed = seedModule.default;
        }
        
        if (typeof runSeed === 'function') {
          await runSeed();
          logger.info('✅ Database seeded successfully!');
        }

        try {
          // @ts-ignore
          const updateImgModule = await import('./update-images.mjs');
          const runUpdateImg = updateImgModule.default;
          if (typeof runUpdateImg === 'function') {
            await runUpdateImg();
            logger.info('✅ Database images updated successfully!');
          }
        } catch (imgErr) {
          logger.error({ err: imgErr }, 'Update images warning');
        }
      } catch (seedErr) {
        logger.error({ err: seedErr }, 'Auto-seed warning (server will continue running)');
      }
    } else {
      // Check for overlapping flags
      const featured = await prisma.product.count({ where: { isFeatured: true } });
      const bestsellers = await prisma.product.count({ where: { isBestSeller: true } });
      const newArrivals = await prisma.product.count({ where: { isNewArrival: true } });
      
      logger.info(`   Flags: Featured=${featured}, Bestsellers=${bestsellers}, New=${newArrivals}`);
      
      if (featured > 25 || newArrivals > 25) {
        logger.info('⚠️  Overlap detected, fixing flags...');
        
        // Reset all
        await prisma.product.updateMany({
          data: { isFeatured: false, isBestSeller: false, isNewArrival: false, isTopRated: false }
        });
        
        // Get products
        const products = await prisma.product.findMany({
          orderBy: { createdAt: 'asc' },
          select: { id: true, soldCount: true, averageRating: true }
        });
        
        // Assign mutually exclusive
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (i < 20) {
            await prisma.product.update({ where: { id: p.id }, data: { isFeatured: true } });
          } else if (i >= 20 && i < 40 && p.soldCount > 5000) {
            await prisma.product.update({ where: { id: p.id }, data: { isBestSeller: true } });
          } else if (i >= 40 && i < 60) {
            await prisma.product.update({ where: { id: p.id }, data: { isNewArrival: true } });
          } else if (i >= 60 && i < 80 && p.averageRating > 4.5) {
            await prisma.product.update({ where: { id: p.id }, data: { isTopRated: true } });
          }
        }
        
        logger.info('✅ Flags fixed!');
      }
    }
    
    logger.info('🎉 Database check complete!');
  } catch (error) {
    logger.error({ error }, "Database connection failed during startup, exiting");
    process.exit(1);
  }

  await connectRedis();

  logger.info({ port }, "Server listening");
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Gracefully shutting down");

  const forceExitTimer = setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (closeErr) => {
    if (closeErr) {
      logger.warn({ err: closeErr }, "Error while closing HTTP server");
    }

    try {
      await closeQueues();
    } catch (error) {
      logger.warn({ error }, "Error closing queues");
    }

    try {
      await disconnectRedis();
    } catch (error) {
      logger.warn({ error }, "Error disconnecting Redis");
    }

    try {
      await disconnectDatabase();
    } catch (error) {
      logger.warn({ error }, "Error disconnecting database");
    }

    logger.info("Shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

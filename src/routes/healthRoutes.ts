import { Router, Request, Response } from 'express';
import { getPrisma } from '../config/database';
import { getRedis } from '../config/redis';
import { config } from '../config';

const router = Router();
const startTime = Date.now();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive', uptime: Math.floor((Date.now() - startTime) / 1000) });
});

router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  try {
    const redis = getRedis();
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  checks.memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
  checks.uptime = `${Math.floor((Date.now() - startTime) / 1000)}s`;

  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';
  res.status(isHealthy ? 200 : 503).json({ status: isHealthy ? 'ready' : 'not ready', checks });
});

export default router;

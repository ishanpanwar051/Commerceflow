import { Response, NextFunction } from 'express';
import { getRedis } from '../config/redis';
import { AuthRequest } from '../types';

const DEFAULT_TTL = 60;

export function cache(ttlSeconds: number = DEFAULT_TTL) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = `cache:${req.originalUrl}`;
    const redis = getRedis();

    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        res.json(parsed);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = function (body: unknown) {
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
        return originalJson(body);
      };
      next();
    } catch {
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedis();
  const keys = await redis.keys(`cache:${pattern}`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

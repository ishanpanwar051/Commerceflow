import { Response, NextFunction } from 'express';
import { getRedis, isRedisAvailable } from '../config/redis';
import { AuthRequest } from '../types';

const DEFAULT_TTL = 60;
const STAMPEDE_LOCK_TTL = 5;
const STAMPEDE_LOCK_RETRY_DELAY = 50;
const STAMPEDE_MAX_RETRIES = 20;

export function cache(ttlSeconds: number = DEFAULT_TTL) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET' || !isRedisAvailable()) {
      next();
      return;
    }

    const key = `cache:${req.originalUrl}`;
    const lockKey = `lock:${key}`;
    const redis = getRedis();

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }

      // Cache stampede protection: acquire a distributed lock
      // Only one request regenerates the cache; others wait and retry
      const lockAcquired = await redis.set(lockKey, '1', 'PX', STAMPEDE_LOCK_TTL * 1000, 'NX');
      if (!lockAcquired) {
        // Another request is regenerating the cache. Wait and retry.
        for (let i = 0; i < STAMPEDE_MAX_RETRIES; i++) {
          await new Promise((resolve) => setTimeout(resolve, STAMPEDE_LOCK_RETRY_DELAY));
          const retryCached = await redis.get(key);
          if (retryCached) {
            res.json(JSON.parse(retryCached));
            return;
          }
        }
        // Lock holder may have crashed; fall through to regenerate
      }

      const originalJson = res.json.bind(res);
      res.json = function (body: unknown) {
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
        redis.del(lockKey).catch(() => {});
        return originalJson(body);
      };
      next();
    } catch {
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  const scanPattern = `cache:${pattern}`;
  let cursor = '0';

  try {
    do {
      const result = await redis.scan(cursor, 'MATCH', scanPattern, 'COUNT', '100');
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    // Log but don't throw — cache invalidation failure should not break the app
    const { logger } = await import('../config/logger');
    logger.error({ pattern, error }, 'Cache invalidation failed');
  }
}

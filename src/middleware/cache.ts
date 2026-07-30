import { Response, NextFunction } from 'express';
import { getRedis, isRedisAvailable } from '../config/redis';
import { logger } from '../config/logger';
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
      const cached = await redis.get(key).catch(() => null);
      if (cached) {
        try {
          res.json(JSON.parse(cached));
        } catch {
          next();
        }
        return;
      }

      // Cache stampede protection: acquire a distributed lock
      const lockAcquired = await redis.set(lockKey, '1', 'PX', STAMPEDE_LOCK_TTL * 1000, 'NX').catch(() => null);
      if (!lockAcquired) {
        for (let i = 0; i < STAMPEDE_MAX_RETRIES; i++) {
          await new Promise((resolve) => setTimeout(resolve, STAMPEDE_LOCK_RETRY_DELAY));
          const retryCached = await redis.get(key).catch(() => null);
          if (retryCached) {
            try {
              res.json(JSON.parse(retryCached));
            } catch {
              next();
            }
            return;
          }
        }
        // Lock holder may have crashed; fall through to regenerate
      }

      const originalJson = res.json.bind(res);
      let responded = false;
      const cleanup = () => {
        if (!responded) {
          responded = true;
          redis.del(lockKey).catch(() => {});
        }
      };
      res.on('close', cleanup);
      res.on('error', cleanup);
      res.json = function (body: unknown) {
        if (responded) return this;
        responded = true;
        if (res.headersSent) {
          logger.warn({ url: req.originalUrl }, 'Cache: headers already sent, skipping');
          return this;
        }
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch((err: Error) => logger.warn({ err }, 'Cache set failed'));
        redis.del(lockKey).catch(() => {});
        res.removeListener('close', cleanup);
        res.removeListener('error', cleanup);
        return originalJson.call(this, body);
      };
      next();
    } catch (err) {
      logger.warn({ err, url: req.originalUrl }, 'Cache middleware error');
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!isRedisAvailable()) return;
  const redis = getRedis();
  // Remove leading 'cache:' if already present, or add it
  const scanPattern = pattern.startsWith('cache:') ? pattern : `cache:${pattern}`;
  let cursor = '0';

  try {
    do {
      const result = await redis.scan(cursor, 'MATCH', scanPattern, 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.error({ pattern, error }, 'Cache invalidation failed');
  }
}

import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 10) {
          logger.error('Redis max retries reached');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error(err, 'redis error'));
    redis.on('close', () => logger.warn('Redis connection closed'));
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  try {
    redis = getRedis();
    await redis.connect();
  } catch (error) {
    logger.error(error, 'Failed to connect to Redis');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info('Redis disconnected');
  }
}

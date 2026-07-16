import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

let redis: Redis | null = null;
let redisAvailable = false;
let retryLogged = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      family: 4,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 10) {
          if (!retryLogged) {
            retryLogged = true;
            logger.warn('Redis is not available - app will run without caching/queues');
          }
          return null;
        }
        const delay = Math.min(Math.round(Math.random() * 200) + (times * 200), 5000);
        return delay;
      },
    });

    redis.on('connect', () => {
      redisAvailable = true;
      retryLogged = false;
      logger.info('Redis connected');
    });
    redis.on('error', (err: Error) => {
      redisAvailable = false;
      if (!retryLogged) {
        logger.warn({ err: err.message }, 'Redis connection error - retrying...');
      }
    });
    redis.on('close', () => {
      redisAvailable = false;
    });
    redis.on('reconnecting', () => {
      if (!retryLogged) {
        logger.warn('Redis reconnecting...');
      }
    });
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  try {
    redis = getRedis();
    await redis.connect();
    redisAvailable = true;
    logger.info('Redis connected successfully');
  } catch (err: any) {
    redisAvailable = false;
    logger.warn({ err: err?.message }, 'Redis is not available - app will run without caching/queues');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (redis) {
    try {
      await redis.quit();
    } catch {
      redis.disconnect();
    }
    redis = null;
    redisAvailable = false;
    retryLogged = false;
    logger.info('Redis disconnected');
  }
}
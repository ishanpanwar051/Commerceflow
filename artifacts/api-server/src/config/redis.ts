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
    const redisOptions: any = {
      host: config.redis.host,
      port: config.redis.port,
      family: 4,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      keepAlive: 10000,
      connectTimeout: 10000,
      retryStrategy: (times: number) => {
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
    };

    if (config.redis.tlsEnabled) {
      redisOptions.tls = {};
      if (config.redis.tlsCa) redisOptions.tls.ca = config.redis.tlsCa;
      if (config.redis.tlsCert) redisOptions.tls.cert = config.redis.tlsCert;
      if (config.redis.tlsKey) redisOptions.tls.key = config.redis.tlsKey;
    }

    if (config.redis.password) {
      redisOptions.password = config.redis.password;
    }

    redis = new Redis(redisOptions);

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
    
    // Try to connect with timeout
    const connectPromise = redis.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
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
    } catch (err) {
      logger.warn({ err }, 'Error during Redis quit, forcing disconnect');
      redis.disconnect();
    }
    redis = null;
    redisAvailable = false;
    retryLogged = false;
    logger.info('Redis disconnected');
  }
}
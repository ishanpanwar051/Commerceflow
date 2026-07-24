import client from 'prom-client';

import { getRedis, isRedisAvailable } from './redis';
import { getPrisma } from './database';
import { logger } from './logger';

const register = new client.Registry();

client.collectDefaultMetrics({ register, prefix: 'commerceflow_' });

const httpRequestDuration = new client.Histogram({
  name: 'commerceflow_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: 'commerceflow_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeUsers = new client.Gauge({
  name: 'commerceflow_active_users',
  help: 'Number of active users',
});

const queueSize = new client.Gauge({
  name: 'commerceflow_queue_size',
  help: 'Number of jobs in queue',
  labelNames: ['queue'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeUsers);
register.registerMetric(queueSize);

export function trackRequest(method: string, route: string, statusCode: number, duration: number) {
  httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration);
  httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
}

export async function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    trackRequest(req.method, route, res.statusCode, duration);
  });
  next();
}

export async function getMetrics() {
  try {
    const prisma = getPrisma();
    const userCount = await prisma.user.count({ where: { isActive: true } });
    activeUsers.set(userCount);
  } catch {}

  if (isRedisAvailable()) {
    try {
      const redis = getRedis();
      const queueNames = new Set<string>();
      let cursor = '0';
      do {
        const result = await redis.scan(cursor, 'MATCH', 'bull:*:id', 'COUNT', 100);
        cursor = result[0];
        for (const key of result[1]) {
          queueNames.add(key.split(':')[1]);
        }
      } while (cursor !== '0');

      for (const name of queueNames) {
        const count = await redis.llen(`bull:${name}:id`);
        queueSize.set({ queue: name }, count);
      }
    } catch {}
  }

  return register.metrics();
}

export { register };

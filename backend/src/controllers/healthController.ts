import { Request, Response } from 'express';
import { getPrisma } from '../config/database';
import { getRedis, isRedisAvailable } from '../config/redis';
import { logger } from '../config/logger';
import os from 'os';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: ServiceHealth;
    redis: ServiceHealth;
    memory: ServiceHealth;
    disk: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  responseTime?: number;
  details?: any;
}

export class HealthController {
  /**
   * Liveness probe - Is the application running?
   * K8s uses this to restart unhealthy pods
   */
  async liveness(_req: Request, res: Response) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Readiness probe - Is the application ready to serve traffic?
   * K8s uses this to route traffic to the pod
   */
  async readiness(_req: Request, res: Response) {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'up');
    const status = allHealthy ? 200 : 503;

    res.status(status).json({
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    });
  }

  /**
   * Full health check with all dependencies and metrics
   */
  async health(_req: Request, res: Response) {
    const startTime = Date.now();

    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
      disk: this.checkDisk(),
    };

    const degradedServices = Object.entries(checks).filter(([_, check]) => check.status === 'degraded');
    const downServices = Object.entries(checks).filter(([_, check]) => check.status === 'down');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (downServices.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices.length > 0) {
      overallStatus = 'degraded';
    }

    const health: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };

    const responseTime = Date.now() - startTime;
    
    logger.info({ health, responseTime }, 'Health check completed');

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(health);
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 100 ? 'up' : 'degraded',
        responseTime,
        message: responseTime >= 100 ? 'Slow response time' : undefined,
      };
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      return {
        status: 'down',
        message: 'Database connection failed',
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    if (!isRedisAvailable()) {
      return {
        status: 'degraded',
        message: 'Redis not configured (app running without caching)',
      };
    }

    const startTime = Date.now();
    try {
      const redis = getRedis();
      await redis.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 50 ? 'up' : 'degraded',
        responseTime,
        message: responseTime >= 50 ? 'Slow response time' : undefined,
      };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return {
        status: 'down',
        message: 'Redis connection failed',
        responseTime: Date.now() - startTime,
      };
    }
  }

  private checkMemory(): ServiceHealth {
    const used = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
    const rssMB = Math.round(used.rss / 1024 / 1024);

    let status: 'up' | 'degraded' | 'down' = 'up';
    let message: string | undefined;

    if (usedPercent > 90 || heapUsedMB > 1500) {
      status = 'degraded';
      message = `High memory usage: ${usedPercent.toFixed(1)}%`;
    }

    return {
      status,
      message,
      details: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        rss: `${rssMB}MB`,
        systemUsed: `${usedPercent.toFixed(1)}%`,
      },
    };
  }

  private checkDisk(): ServiceHealth {
    // Note: More accurate disk check would require additional libraries
    // This is a simplified version
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;

    // Load average normalized by CPU count
    const normalizedLoad = loadAvg[0] / cpuCount;

    let status: 'up' | 'degraded' | 'down' = 'up';
    let message: string | undefined;

    if (normalizedLoad > 0.8) {
      status = 'degraded';
      message = `High CPU load: ${(normalizedLoad * 100).toFixed(1)}%`;
    }

    return {
      status,
      message,
      details: {
        loadAverage: loadAvg.map(l => l.toFixed(2)),
        cpuCount,
        normalizedLoad: normalizedLoad.toFixed(2),
      },
    };
  }

  /**
   * Metrics endpoint for monitoring systems (Prometheus, Datadog, etc.)
   */
  async metrics(_req: Request, res: Response) {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      process: {
        uptime_seconds: uptime,
        cpu_user_seconds: cpuUsage.user / 1000000,
        cpu_system_seconds: cpuUsage.system / 1000000,
        memory_heap_bytes: memUsage.heapUsed,
        memory_heap_total_bytes: memUsage.heapTotal,
        memory_rss_bytes: memUsage.rss,
        memory_external_bytes: memUsage.external,
      },
      nodejs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      system: {
        load_average: os.loadavg(),
        total_memory_bytes: os.totalmem(),
        free_memory_bytes: os.freemem(),
        cpu_count: os.cpus().length,
      },
    };

    res.status(200).json(metrics);
  }
}

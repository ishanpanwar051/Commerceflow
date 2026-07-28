import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { logger } from './logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const poolUrl = config.database.poolUrl || config.database.url;
    
    // Determine if using PostgreSQL based on connection string
    const isPostgres = poolUrl.startsWith('postgresql://') || poolUrl.startsWith('postgres://');

    prisma = new PrismaClient({
      datasources: { db: { url: poolUrl } },
      log: config.isDev
        ? [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'info' }, { emit: 'event', level: 'warn' }, { emit: 'event', level: 'error' }]
        : [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }],
    });

    if (config.isDev) {
      prisma.$on('query' as never, (e: any) => {
        logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'database query');
      });
    }

    prisma.$on('error' as never, (e: any) => {
      logger.error(e, 'prisma error');
    });
    
    // Log database type
    logger.info({ database: isPostgres ? 'PostgreSQL' : 'SQLite' }, 'Database client initialized');
  }
  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    prisma = getPrisma();
    await prisma.$connect();
    
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1 as health`;
    
    logger.info('Database connected successfully');
  } catch (error) {
    logger.fatal(error, 'Failed to connect to database');
    throw new Error('Failed to connect to database');
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1 as health`;
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
}

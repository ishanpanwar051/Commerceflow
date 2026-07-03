import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { logger } from './logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
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
  }
  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    prisma = getPrisma();
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.fatal(error, 'Failed to connect to database');
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
}

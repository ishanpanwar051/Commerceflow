import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from './logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required');

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    // @ts-ignore – v7 adapter constructor
    prisma = new PrismaClient({ adapter } as any);

    prisma.$on('error' as never, (e: any) => {
      logger.error(e, 'prisma error');
    });

    logger.info('Database client initialized (PostgreSQL)');
  }
  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    prisma = getPrisma();
    await prisma.$connect();
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
    const p = getPrisma();
    await p.$queryRaw`SELECT 1 as health`;
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
}

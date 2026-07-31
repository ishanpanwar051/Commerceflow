import { app } from './app';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import http from 'http';

let server: http.Server | undefined;

async function start() {
  await connectDatabase();
  await connectRedis();

  server = app.listen(config.port, config.host, () => {
    logger.info({ port: config.port, env: config.env }, `CommerceFlow API started`);
  });
}

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');

  if (server) {
    await new Promise<void>((resolve) => {
      server!.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        await disconnectRedis();
        resolve();
      });
      setTimeout(() => {
        logger.warn('Forced shutdown');
        process.exit(1);
      }, 10000).unref();
    });
  }

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught exception');
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

start().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});

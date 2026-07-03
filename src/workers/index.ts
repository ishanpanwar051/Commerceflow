import { Worker } from 'bullmq';
import { config } from '../config';
import { logger } from '../config/logger';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { connectRedis, disconnectRedis } from '../config/redis';
import { processEmailJob, processInvoiceJob, processNotificationJob, processCouponJob } from './processors';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

const workers: Worker[] = [];

async function startWorkers() {
  await connectDatabase();
  await connectRedis();

  const emailWorker = new Worker('email', processEmailJob, {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  });

  const invoiceWorker = new Worker('invoice', processInvoiceJob, {
    connection,
    concurrency: 2,
  });

  const notificationWorker = new Worker('notification', processNotificationJob, {
    connection,
    concurrency: 3,
  });

  const couponWorker = new Worker('coupon', processCouponJob, {
    connection,
    concurrency: 1,
  });

  workers.push(emailWorker, invoiceWorker, notificationWorker, couponWorker);

  for (const worker of workers) {
    worker.on('completed', (job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Job completed');
    });
    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, name: job?.name, err }, 'Job failed');
    });
  }

  logger.info('Workers started successfully');
}

async function shutdown() {
  logger.info('Shutting down workers...');
  await Promise.all(workers.map(w => w.close()));
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startWorkers().catch((err) => {
  logger.fatal(err, 'Failed to start workers');
  process.exit(1);
});

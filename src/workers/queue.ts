import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedis } from '../config/redis';
import { config } from '../config';
import { logger } from '../config/logger';
import { getPrisma } from '../config/database';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 * 24 * 7 },
    removeOnFail: { age: 3600 * 24 * 30 },
  },
});

export const invoiceQueue = new Queue('invoice', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 * 24 * 7 },
    removeOnFail: { age: 3600 * 24 * 30 },
  },
});

export const notificationQueue = new Queue('notification', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 * 24 * 7 },
    removeOnFail: { age: 3600 * 24 * 30 },
  },
});

export const couponQueue = new Queue('coupon', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: { age: 3600 * 24 },
  },
});

const queues = { email: emailQueue, invoice: invoiceQueue, notification: notificationQueue, coupon: couponQueue };

export async function addJob(name: string, data: Record<string, unknown>, options?: { delay?: number; priority?: number }) {
  const queueMap: Record<string, Queue> = {
    'order-confirmation': emailQueue,
    'payment-confirmation': emailQueue,
    'welcome-email': emailQueue,
    'password-reset': emailQueue,
    'email-verification': emailQueue,
    'low-stock': notificationQueue,
    'invoice-generation': invoiceQueue,
    'coupon-expiration': couponQueue,
    'image-processing': notificationQueue,
  };

  const queue = queueMap[name] || emailQueue;

  const job = await queue.add(name, data, {
    ...(options?.delay && { delay: options.delay }),
    ...(options?.priority && { priority: options.priority }),
  });

  await getPrisma().jobRecord.create({
    data: {
      jobId: job.id || '',
      name,
      status: 'queued',
      data: data as any,
      maxAttempts: 3,
    },
  }).catch((err) => logger.error({ err }, 'Failed to save job record'));

  return job;
}

export async function getQueueStatus() {
  const status: Record<string, any> = {};
  for (const [name, queue] of Object.entries(queues)) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    status[name] = { waiting, active, completed, failed, delayed };
  }
  return status;
}

export async function closeQueues() {
  await Promise.all(Object.values(queues).map(q => q.close()));
}

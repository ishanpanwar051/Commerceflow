import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { getRedis, isRedisAvailable } from '../config/redis';
import { config } from '../config';
import { logger } from '../config/logger';
import { getPrisma } from '../config/database';

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

let emailQueue: Queue | null = null;
let invoiceQueue: Queue | null = null;
let notificationQueue: Queue | null = null;
let couponQueue: Queue | null = null;

function getQueue(name: string): Queue | null {
  if (!isRedisAvailable()) return null;

  const create = (qName: string): Queue => new Queue(qName, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 3600 * 24 * 7 },
      removeOnFail: { age: 3600 * 24 * 30 },
    },
  });

  switch (name) {
    case 'email':
      if (!emailQueue) emailQueue = create('email');
      return emailQueue;
    case 'invoice':
      if (!invoiceQueue) invoiceQueue = create('invoice');
      return invoiceQueue;
    case 'notification':
      if (!notificationQueue) notificationQueue = create('notification');
      return notificationQueue;
    case 'coupon':
      if (!couponQueue) couponQueue = create('coupon');
      return couponQueue;
    default:
      return null;
  }
}

export async function addJob(name: string, data: Record<string, unknown>, options?: { delay?: number; priority?: number }) {
  if (!isRedisAvailable()) {
    logger.warn({ jobName: name }, 'Redis unavailable, skipping job');
    return null;
  }

  const queueMap: Record<string, string> = {
    'order-confirmation': 'email',
    'payment-confirmation': 'email',
    'welcome-email': 'email',
    'password-reset': 'email',
    'email-verification': 'email',
    'low-stock': 'notification',
    'invoice-generation': 'invoice',
    'coupon-expiration': 'coupon',
    'image-processing': 'notification',
  };

  const queueName = queueMap[name] || 'email';
  const queue = getQueue(queueName);
  if (!queue) {
    logger.warn({ queueName }, 'Queue not available');
    return null;
  }

  const customJobId = uuidv4();

  const job = await queue.add(name, data, {
    jobId: customJobId,
    ...(options?.delay && { delay: options.delay }),
    ...(options?.priority && { priority: options.priority }),
  });

  getPrisma().jobRecord.create({
    data: {
      jobId: job.id || customJobId,
      name,
      status: 'QUEUED',
      data: data as any,
      maxAttempts: 3,
    },
  }).catch((err) => logger.error({ err }, 'Failed to save job record'));

  return job;
}

export async function getQueueStatus() {
  if (!isRedisAvailable()) return {};

  const status: Record<string, any> = {};
  const queues = ['email', 'invoice', 'notification', 'coupon'];
  for (const name of queues) {
    const queue = getQueue(name);
    if (!queue) continue;
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
  const queues = [emailQueue, invoiceQueue, notificationQueue, couponQueue].filter(Boolean) as Queue[];
  await Promise.all(queues.map(q => q.close()));
  emailQueue = null;
  invoiceQueue = null;
  notificationQueue = null;
  couponQueue = null;
}

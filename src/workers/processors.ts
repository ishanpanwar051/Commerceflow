import { Job } from 'bullmq';
import { logger } from '../config/logger';
import { getPrisma } from '../config/database';
import {
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordReset,
  sendEmailVerification,
  sendLowStockNotification,
  generateInvoicePdf,
} from '../services/emailService';

export async function processEmailJob(job: Job) {
  const { name, data } = job;
  logger.info({ jobId: job.id, name, email: data.email }, 'Processing email job');

  try {
    switch (name) {
      case 'order-confirmation':
        await sendOrderConfirmation(job.data as any);
        break;
      case 'payment-confirmation':
        await sendOrderConfirmation(job.data as any);
        break;
      case 'welcome-email':
        await sendWelcomeEmail(job.data as any);
        break;
      case 'password-reset':
        await sendPasswordReset(job.data as any);
        break;
      case 'email-verification':
        await sendEmailVerification(job.data as any);
        break;
      default:
        logger.warn({ name }, 'Unknown email job type');
    }

    await saveJobResult(job.id!, 'completed');
    return { success: true, name };
  } catch (error: any) {
    await saveJobResult(job.id!, 'failed', error.message, job.attemptsMade);
    throw error;
  }
}

export async function processInvoiceJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing invoice job');
  try {
    const pdfBuffer = await generateInvoicePdf(job.data as any);
    logger.info({ jobId: job.id, size: pdfBuffer.length }, 'Invoice PDF generated');
    await saveJobResult(job.id!, 'completed');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'failed', error.message);
    throw error;
  }
}

export async function processNotificationJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing notification job');
  try {
    if (job.name === 'low-stock') {
      await sendLowStockNotification(job.data as any);
    }
    await saveJobResult(job.id!, 'completed');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'failed', error.message);
    throw error;
  }
}

export async function processCouponJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing coupon job');
  try {
    await saveJobResult(job.id!, 'completed');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'failed', error.message);
    throw error;
  }
}

async function saveJobResult(jobId: string, status: string, error?: string, attemptsMade?: number) {
  try {
    const prisma = getPrisma();
    const data: any = { status };
    if (status === 'completed') data.processedAt = new Date();
    if (error) data.error = error;
    if (attemptsMade !== undefined) data.attempts = attemptsMade;
    await prisma.jobRecord.update({ where: { jobId }, data });
  } catch {}
}

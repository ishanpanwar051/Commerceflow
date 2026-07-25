import { Job } from 'bullmq';
import { logger } from '../config/logger';
import { config } from '../config';
import { getPrisma } from '../config/database';
import { getTransporter } from '../services/emailService';
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

    await saveJobResult(job.id!, 'COMPLETED');
    return { success: true, name };
  } catch (error: any) {
    await saveJobResult(job.id!, 'FAILED', error.message, job.attemptsMade);
    throw error;
  }
}

export async function processInvoiceJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing invoice job');
  try {
    const pdfBuffer = await generateInvoicePdf(job.data as any);
    logger.info({ jobId: job.id, size: pdfBuffer.length }, 'Invoice PDF generated');

    const { email, orderNumber } = job.data as any;
    if (email) {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: config.smtp.from,
        to: email,
        subject: `Invoice for Order #${orderNumber}`,
        html: `<p>Thank you for your order. Your invoice is attached.</p>`,
        attachments: [{
          filename: `invoice-${orderNumber}.pdf`,
          content: pdfBuffer,
        }],
      });
      logger.info({ jobId: job.id, email, orderNumber }, 'Invoice PDF emailed');
    }

    await saveJobResult(job.id!, 'COMPLETED');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'FAILED', error.message);
    throw error;
  }
}

export async function processNotificationJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing notification job');
  try {
    if (job.name === 'low-stock') {
      await sendLowStockNotification(job.data as any);
    }
    await saveJobResult(job.id!, 'COMPLETED');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'FAILED', error.message);
    throw error;
  }
}

export async function processCouponJob(job: Job) {
  logger.info({ jobId: job.id, name: job.name }, 'Processing coupon job');
  try {
    const prisma = getPrisma();

    if (job.name === 'coupon-expiration') {
      const now = new Date();
      const expired = await prisma.coupon.updateMany({
        where: { expiresAt: { lte: now }, isActive: true, deletedAt: null },
        data: { isActive: false },
      });
      logger.info({ jobId: job.id, count: expired.count }, 'Deactivated expired coupons');
    }

    if (job.name === 'coupon-usage-limit') {
      const { couponId } = job.data as { couponId: string };
      if (couponId) {
        const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (coupon && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          await prisma.coupon.update({
            where: { id: couponId },
            data: { isActive: false },
          });
          logger.info({ jobId: job.id, couponId, code: coupon.code }, 'Deactivated coupon due to usage limit');
        }
      }
    }

    await saveJobResult(job.id!, 'COMPLETED');
    return { success: true };
  } catch (error: any) {
    await saveJobResult(job.id!, 'FAILED', error.message);
    throw error;
  }
}

async function saveJobResult(jobId: string, status: 'COMPLETED' | 'FAILED', error?: string, attemptsMade?: number) {
  try {
    const prisma = getPrisma();
    const data: any = { status };
    if (status === 'COMPLETED') data.processedAt = new Date();
    if (error) data.error = error;
    if (attemptsMade !== undefined) data.attempts = attemptsMade;
    await prisma.jobRecord.upsert({
      where: { jobId },
      update: data,
      create: { jobId, name: 'unknown', status, maxAttempts: 3, data: {} },
    });
  } catch (err) {
    logger.error({ err, jobId, status }, 'Failed to save job result');
  }
}

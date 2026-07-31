import Stripe from 'stripe';
import { config } from '../config';
import { getPrisma } from '../config/database';
import { logger } from '../config/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { addJob } from '../workers/queue';

const WEBHOOK_EVENT_TTL = 24 * 60 * 60 * 1000;

let stripeInstance: Stripe | null = null;
export function getStripe(): Stripe | null {
  if (!stripeInstance && config.stripe.secretKey) {
    stripeInstance = new Stripe(config.stripe.secretKey, { apiVersion: '2024-12-18.acacia' });
  }
  return stripeInstance;
}

export class PaymentService {
  async createPaymentIntent(orderId: string, userId: string) {
    const stripe = getStripe();
    if (!stripe) throw new BadRequestError('Stripe not configured');

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order');
    if (order.userId !== userId) throw new NotFoundError('Order');

    const existingPayment = await prisma.payment.findFirst({
      where: { orderId, status: { not: 'FAILED' } },
    });
    if (existingPayment) {
      const clientSecret = existingPayment.clientSecret ||
        (await stripe.paymentIntents.retrieve(existingPayment.stripePaymentId)).client_secret;
      if (!clientSecret) throw new BadRequestError('Failed to retrieve payment client secret');
      return {
        clientSecret,
        paymentIntentId: existingPayment.stripeIntentId,
        amount: order.grandTotal,
        existing: true,
      };
    }

    const idempotencyKey = `order:${orderId}:${order.grandTotal}`;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.grandTotal,
      currency: 'usd',
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
    }, {
      idempotencyKey,
    });

    try {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          userId,
          stripePaymentId: paymentIntent.id,
          stripeIntentId: paymentIntent.id,
          amount: order.grandTotal,
          currency: 'usd',
          status: 'PENDING',
          clientSecret: paymentIntent.client_secret,
          idempotencyKey,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as any).code === 'P2002') {
        const existing = await prisma.payment.findFirst({
          where: { orderId, status: { not: 'FAILED' } },
        });
        if (existing) {
          const clientSecret = existing.clientSecret ||
            (await stripe.paymentIntents.retrieve(existing.stripePaymentId)).client_secret;
          if (!clientSecret) throw new BadRequestError('Failed to retrieve payment client secret');
          return {
            clientSecret,
            paymentIntentId: existing.stripeIntentId,
            amount: order.grandTotal,
            existing: true,
          };
        }
      }
      throw err;
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.grandTotal,
      existing: false,
    };
  }

  async confirmPayment(paymentIntentId: string, userId: string) {
    const stripe = getStripe();
    if (!stripe) throw new BadRequestError('Stripe not configured');

    const prisma = getPrisma();

    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.userId !== userId) throw new NotFoundError('Payment');

    if (payment.status === 'COMPLETED') {
      logger.info({ paymentIntentId }, 'Payment already confirmed, skipping duplicate');
      return { status: 'succeeded', payment, duplicate: true };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['charges'] });

    if (paymentIntent.status === 'succeeded') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
            paymentMethod: paymentIntent.payment_method?.toString(),
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED', paidAt: new Date() },
        });
      });

      await addJob('payment-confirmation', {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
      });
    }

    return { status: paymentIntent.status, payment, duplicate: false };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const stripe = getStripe();
    if (!stripe) throw new BadRequestError('Stripe not configured');

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch (err) {
      throw new BadRequestError('Invalid webhook signature');
    }

    const prisma = getPrisma();
    const eventId = event.id;

    const alreadyProcessed = await prisma.idempotencyRecord.findUnique({
      where: { key: `stripe:webhook:${eventId}` },
    });
    if (alreadyProcessed) {
      logger.info({ eventId, eventType: event.type }, 'Duplicate webhook event, skipping');
      return { received: true, duplicate: true };
    }

    try {
      await prisma.idempotencyRecord.create({
        data: {
          key: `stripe:webhook:${eventId}`,
          method: 'WEBHOOK',
          path: `/payments/webhook`,
          expiresAt: new Date(Date.now() + WEBHOOK_EVENT_TTL),
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as any).code === 'P2002') {
        logger.info({ eventId, eventType: event.type }, 'Duplicate webhook event (concurrent), skipping');
        return { received: true, duplicate: true };
      }
      throw err;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: paymentIntent.id },
          });
          if (payment) {
            await this.confirmPayment(paymentIntent.id, payment.userId);
          }
          break;
        }
        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: paymentIntent.id },
          });
          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'FAILED',
                failureMessage: paymentIntent.last_payment_error?.message,
              },
            });
          }
          break;
        }
        default: {
          logger.info({ eventType: event.type, eventId }, 'Unhandled webhook event type');
        }
      }
    } catch (err) {
      logger.error({ err, eventId }, 'Webhook processing failed — idempotency record preserved');
      throw err;
    }

    return { received: true, duplicate: false };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const prisma = getPrisma();
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        include: { order: { select: { orderNumber: true, grandTotal: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);
    return { payments, total, page, limit };
  }
}

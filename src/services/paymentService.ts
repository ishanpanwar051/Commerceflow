import { config } from '../config';
import { getPrisma } from '../config/database';
import { logger } from '../config/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { addJob } from '../workers/queue';

const stripe = config.stripe.secretKey
  ? require('stripe')(config.stripe.secretKey)
  : null;

export class PaymentService {
  async createPaymentIntent(orderId: string, userId: string) {
    if (!stripe) throw new BadRequestError('Stripe not configured');

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order');
    if (order.userId !== userId) throw new NotFoundError('Order');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.grandTotal) * 100),
      currency: 'usd',
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        stripePaymentId: paymentIntent.id,
        stripeIntentId: paymentIntent.id,
        amount: order.grandTotal,
        currency: 'usd',
        status: 'pending',
        idempotencyKey: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.grandTotal,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    if (!stripe) throw new BadRequestError('Stripe not configured');

    const prisma = getPrisma();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
    });
    if (!payment) throw new NotFoundError('Payment');

    if (paymentIntent.status === 'succeeded') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          paidAt: new Date(),
          receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
          paymentMethod: paymentIntent.payment_method?.toString(),
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED', paidAt: new Date() },
      });

      await addJob('payment-confirmation', {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
      });
    }

    return { status: paymentIntent.status, payment };
  }

  async handleWebhook(rawBody: string, signature: string) {
    if (!stripe) throw new BadRequestError('Stripe not configured');

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch (err) {
      throw new BadRequestError('Invalid webhook signature');
    }

    const prisma = getPrisma();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.confirmPayment(paymentIntent.id);
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
              status: 'failed',
              failureMessage: paymentIntent.last_payment_error?.message,
            },
          });
        }
        break;
      }
    }

    return { received: true };
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

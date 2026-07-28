import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { PaymentService } from '../services/paymentService';
import { sendSuccess } from '../utils/helpers';
import { AuthRequest } from '../types';
import { z } from 'zod';

const router = Router();
const paymentService = new PaymentService();

const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});
const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

router.post('/create-payment-intent', paymentLimiter, authenticate, validate(createPaymentIntentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const result = await paymentService.createPaymentIntent(orderId, req.user!.userId);
    sendSuccess(res, result, 'Payment intent created');
  } catch (error) { next(error); }
});

router.post('/confirm', paymentLimiter, authenticate, validate(confirmPaymentSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;
    const result = await paymentService.confirmPayment(paymentIntentId, req.user!.userId);
    sendSuccess(res, result, 'Payment confirmed');
  } catch (error) { next(error); }
});

router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as { rawBody?: string }).rawBody || '';
    const result = await paymentService.handleWebhook(rawBody, signature);
    sendSuccess(res, result, 'Webhook processed');
  } catch (error) { next(error); }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const result = await paymentService.getPaymentHistory(req.user!.userId, page, limit);
    sendSuccess(res, result.payments, 'Payment history fetched successfully');
  } catch (error) { next(error); }
});

export default router;

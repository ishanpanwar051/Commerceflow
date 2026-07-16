import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';
import { sendSuccess } from '../utils/helpers';
import { AuthRequest } from '../types';

const router = Router();
const paymentService = new PaymentService();

router.post('/create-payment-intent', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    const result = await paymentService.createPaymentIntent(orderId, req.user!.userId);
    sendSuccess(res, result, 'Payment intent created');
  } catch (error) { next(error); }
});

router.post('/confirm', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;
    const result = await paymentService.confirmPayment(paymentIntentId);
    sendSuccess(res, result, 'Payment confirmed');
  } catch (error) { next(error); }
});

router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as { rawBody?: string }).rawBody || '';
    const result = await paymentService.handleWebhook(rawBody, signature);
    res.json(result);
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

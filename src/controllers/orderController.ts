import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { PaymentService, getStripe } from '../services/paymentService';
import { AuthRequest } from '../types';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';
import { markIdempotencyComplete, markIdempotencyOrder } from '../middleware/idempotency';
import { logger } from '../config/logger';

const orderService = new OrderService();
const paymentService = new PaymentService();

export class OrderController {
  async checkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.checkout(req.user!.userId, {
        ...req.body,
        idempotencyKey: req.idempotencyKey,
      });

      let paymentIntent = null;

      // Attempt to create a Stripe payment intent if Stripe is configured
      try {
        if (getStripe()) {
          paymentIntent = await paymentService.createPaymentIntent(order.id, req.user!.userId);
        }
      } catch (err) {
        logger.warn({ err, orderId: order.id }, 'Could not create payment intent - payment will be handled separately');
      }

      if (req.idempotencyKey) {
        await markIdempotencyOrder(req.idempotencyKey, order.id);
      }

      const response = { order, paymentIntent };
      if (req.idempotencyKey) {
        await markIdempotencyComplete(req.idempotencyKey, 201, {
          success: true,
          message: 'Checkout successful',
          data: response,
        });
      }

      sendSuccess(res, response, 'Checkout successful', 201);
    } catch (error) { next(error); }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = String(req.params.id);
      const order = await orderService.getOrder(req.user!.userId, orderId);
      sendSuccess(res, order, 'Order fetched successfully');
    } catch (error) { next(error); }
  }

  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const result = await orderService.getUserOrders(req.user!.userId, page, limit);
      sendSuccess(res, result.orders, 'Orders fetched successfully', 200, calculatePaginationMeta(result.total, page, limit));
    } catch (error) { next(error); }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = String(req.params.id);
      const order = await orderService.cancelOrder(req.user!.userId, orderId, req.body.reason);
      sendSuccess(res, order, 'Order cancelled successfully');
    } catch (error) { next(error); }
  }

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = String(req.params.id);
      const order = await orderService.updateOrderStatus(orderId, req.body.status);
      sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) { next(error); }
  }

  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const status = req.query.status as string | undefined;
      const result = await orderService.getAllOrders(page, limit, status);
      sendSuccess(res, result.orders, 'Orders fetched successfully', 200, calculatePaginationMeta(result.total, page, limit));
    } catch (error) { next(error); }
  }
}

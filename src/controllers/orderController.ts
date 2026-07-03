import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../types';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';
import { markIdempotencyComplete, markIdempotencyOrder } from '../middleware/idempotency';

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
      try {
        paymentIntent = await paymentService.createPaymentIntent(order.id, req.user!.userId);
      } catch { }

      if (req.idempotencyKey) {
        await markIdempotencyOrder(req.idempotencyKey, order.id);
      }

      const response = { order, paymentIntent };
      if (req.idempotencyKey) {
        await markIdempotencyComplete(req.idempotencyKey, 201, { success: true, message: 'Checkout successful', data: response });
      }

      sendSuccess(res, response, 'Checkout successful', 201);
    } catch (error) { next(error); }
  }

  async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrder(req.user!.userId, req.params.id as string);
      sendSuccess(res, order, 'Order fetched successfully');
    } catch (error) { next(error); }
  }

  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await orderService.getUserOrders(req.user!.userId, page, limit);
      sendSuccess(res, result.orders, 'Orders fetched successfully', 200, calculatePaginationMeta(result.total, page, limit));
    } catch (error) { next(error); }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.cancelOrder(req.user!.userId, req.params.id as string, req.body.reason);
      sendSuccess(res, order, 'Order cancelled successfully');
    } catch (error) { next(error); }
  }

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id as string, req.body.status);
      sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) { next(error); }
  }

  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const result = await orderService.getAllOrders(page, limit, status);
      sendSuccess(res, result.orders, 'Orders fetched successfully', 200, calculatePaginationMeta(result.total, page, limit));
    } catch (error) { next(error); }
  }
}

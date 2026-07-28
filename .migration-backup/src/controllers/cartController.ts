import { Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

const cartService = new CartService();

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getCart(req.user!.userId);
      sendSuccess(res, cart, 'Cart fetched successfully');
    } catch (error) { next(error); }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body;
      const cart = await cartService.addItem(req.user!.userId, productId, quantity);
      sendSuccess(res, cart, 'Item added to cart', 201);
    } catch (error) { next(error); }
  }

  async updateItemQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.updateItemQuantity(req.user!.userId, req.params.productId as string, req.body.quantity);
      sendSuccess(res, cart, 'Cart updated successfully');
    } catch (error) { next(error); }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.removeItem(req.user!.userId, req.params.productId as string);
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (error) { next(error); }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clearCart(req.user!.userId);
      sendSuccess(res, cart, 'Cart cleared');
    } catch (error) { next(error); }
  }

  async applyCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await cartService.applyCoupon(req.user!.userId, req.body.code);
      sendSuccess(res, result, 'Coupon applied successfully');
    } catch (error) { next(error); }
  }
}

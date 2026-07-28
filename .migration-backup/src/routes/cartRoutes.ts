import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { cartItemSchema, updateCartItemSchema, applyCouponSchema } from '../validators';

const router = Router();
const controller = new CartController();

router.use(authenticate);

router.get('/', controller.getCart.bind(controller));
router.post('/items', validate(cartItemSchema), controller.addItem.bind(controller));
router.patch('/items/:productId', validate(updateCartItemSchema), controller.updateItemQuantity.bind(controller));
router.delete('/items/:productId', controller.removeItem.bind(controller));
router.delete('/', controller.clearCart.bind(controller));
router.post('/apply-coupon', validate(applyCouponSchema), controller.applyCoupon.bind(controller));

export default router;

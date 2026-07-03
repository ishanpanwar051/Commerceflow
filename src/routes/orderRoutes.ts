import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema, orderStatusSchema } from '../validators';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();
const controller = new OrderController();

router.post('/checkout', authenticate, idempotencyMiddleware, validate(checkoutSchema), controller.checkout.bind(controller));
router.get('/', authenticate, controller.getUserOrders.bind(controller));
router.get('/:id', authenticate, controller.getOrder.bind(controller));
router.post('/:id/cancel', authenticate, controller.cancelOrder.bind(controller));

router.get('/admin/all', authenticate, authorize('ADMIN'), controller.getAllOrders.bind(controller));
router.patch('/admin/:id/status', authenticate, authorize('ADMIN'), validate(orderStatusSchema), controller.updateOrderStatus.bind(controller));

export default router;

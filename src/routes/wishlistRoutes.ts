import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { wishlistItemSchema } from '../validators';
import { WishlistRepository } from '../repositories';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

const router = Router();
const repo = new WishlistRepository();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await repo.findByUser(req.user!.userId);
    sendSuccess(res, items, 'Wishlist fetched successfully');
  } catch (error) { next(error); }
});

router.post('/', validate(wishlistItemSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await repo.addItem(req.user!.userId, req.body.productId);
    sendSuccess(res, item, 'Added to wishlist', 201);
  } catch (error) { next(error); }
});

router.delete('/:productId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await repo.removeItem(req.user!.userId, String(req.params.productId));
    sendSuccess(res, null, 'Removed from wishlist');
  } catch (error) { next(error); }
});

export default router;

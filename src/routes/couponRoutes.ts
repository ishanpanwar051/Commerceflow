import { Router, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { couponSchema } from '../validators';
import { CouponRepository } from '../repositories';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();
const repo = new CouponRepository();

router.post('/', authenticate, authorize('ADMIN'), validate(couponSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const coupon = await repo.create(req.body);
    sendSuccess(res, coupon, 'Coupon created successfully', 201);
  } catch (error) { next(error); }
});

router.get('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const coupons = await repo.findAll();
    sendSuccess(res, coupons, 'Coupons fetched successfully');
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await repo.softDelete(String(req.params.id));
    sendSuccess(res, null, 'Coupon deleted successfully');
  } catch (error) { next(error); }
});

router.post('/validate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await repo.findByCode(code.toUpperCase());
    if (!coupon) throw new NotFoundError('Coupon');
    if (!coupon.isActive || coupon.deletedAt) throw new BadRequestError('Coupon is expired');
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new BadRequestError('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestError('Coupon usage limit reached');
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw new BadRequestError(`Minimum order amount of $${coupon.minOrderAmount} required`);
    }
    sendSuccess(res, coupon, 'Coupon is valid');
  } catch (error) { next(error); }
});

export default router;

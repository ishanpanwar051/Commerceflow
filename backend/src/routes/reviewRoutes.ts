import { Router, Response, NextFunction } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema, updateReviewSchema } from '../validators';
import { ReviewRepository } from '../repositories';
import { AuthRequest } from '../types';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

const router = Router();
const repo = new ReviewRepository();

router.get('/product/:productId', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      repo.findByProduct(req.params.productId as string, skip, limit),
      repo.countByProduct(req.params.productId as string),
    ]);
    sendSuccess(res, reviews, 'Reviews fetched successfully', 200, calculatePaginationMeta(total, page, limit));
  } catch (error) { next(error); }
});

router.post('/product/:productId', authenticate, validate(reviewSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await repo.findByUserAndProduct(req.user!.userId, req.params.productId as string);
    if (existing) throw new BadRequestError('You have already reviewed this product');
    const review = await repo.create({
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
      user: { connect: { id: req.user!.userId } },
      product: { connect: { id: req.params.productId as string } },
    });
    sendSuccess(res, review, 'Review added successfully', 201);
  } catch (error) { next(error); }
});

router.patch('/:id', authenticate, validate(updateReviewSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await repo.findById(req.params.id as string);
    if (!existing) throw new NotFoundError('Review');
    if (existing.userId !== req.user!.userId) throw new ForbiddenError('You can only edit your own reviews');
    const review = await repo.update(req.params.id as string, req.body);
    sendSuccess(res, review, 'Review updated successfully');
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await repo.findById(req.params.id as string);
    if (!existing) throw new NotFoundError('Review');
    if (existing.userId !== req.user!.userId) throw new ForbiddenError('You can only delete your own reviews');
    await repo.softDelete(req.params.id as string);
    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) { next(error); }
});

export default router;

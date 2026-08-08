import { Router, Response, NextFunction } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import couponRoutes from './couponRoutes';
import wishlistRoutes from './wishlistRoutes';
import reviewRoutes from './reviewRoutes';
import paymentRoutes from './paymentRoutes';
import healthRoutes from './healthRoutes';
import metricsRoutes from './metricsRoutes';
import churnRoutes from './churnRoutes';
import debugRoutes from './debug.routes.js';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';
import { sendSuccess, calculatePaginationMeta } from '../utils/helpers';
import { getPrisma } from '../config/database';

const router = Router();

router.use('/metrics', metricsRoutes);
router.use('/churn', churnRoutes);
router.use('/debug', debugRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/health', healthRoutes);

// Admin routes
const adminRouter = Router();
adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/dashboard', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const [totalOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, isActive: true } }),
      prisma.user.count({ where: { isActive: true, deletedAt: null, role: 'CUSTOMER' } }),
      prisma.order.findMany({
        where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5,
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, items: { take: 1 } },
      }),
    ]);
    const revenueResult = await prisma.order.aggregate({
      where: { deletedAt: null, status: 'DELIVERED' }, _sum: { grandTotal: true },
    });
    sendSuccess(res, { revenue: revenueResult._sum.grandTotal || 0, totalOrders, totalProducts, totalCustomers, recentOrders }, 'Dashboard stats fetched');
  } catch (error) { next(error); }
});

adminRouter.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '10'), 10)));
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    const search = String(req.query.search ?? '');
    if (search) where.OR = [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }];
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, isEmailVerified: true, createdAt: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.user.count({ where }),
    ]);
    sendSuccess(res, users, 'Users fetched', 200, calculatePaginationMeta(total, page, limit));
  } catch (error) { next(error); }
});

adminRouter.patch('/users/:userId/toggle-status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const userId = req.params.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isActive: true } });
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive }, select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } });
    sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) { next(error); }
});

adminRouter.patch('/users/:userId/role', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validRoles = ['ADMIN', 'CUSTOMER', 'SELLER', 'DELIVERY_BOY'];
    if (!validRoles.includes(req.body.role)) { res.status(400).json({ success: false, error: 'Invalid role' }); return; }
    const prisma = getPrisma();
    const updated = await prisma.user.update({ where: { id: req.params.userId as string }, data: { role: req.body.role }, select: { id: true, email: true, firstName: true, lastName: true, role: true } });
    sendSuccess(res, updated, 'Role updated');
  } catch (error) { next(error); }
});

adminRouter.get('/reviews', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '10'), 10)));
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({ where: { deletedAt: null }, include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, product: { select: { id: true, name: true, slug: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.review.count({ where: { deletedAt: null } }),
    ]);
    sendSuccess(res, reviews, 'Reviews fetched', 200, calculatePaginationMeta(total, page, limit));
  } catch (error) { next(error); }
});

adminRouter.get('/inventory', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const inventory = await prisma.inventory.findMany({ where: { product: { deletedAt: null, isActive: true } }, include: { product: { select: { id: true, name: true, sku: true, images: { take: 1, orderBy: { order: 'asc' } } } } }, orderBy: { stock: 'asc' } });
    sendSuccess(res, inventory, 'Inventory fetched');
  } catch (error) { next(error); }
});

adminRouter.patch('/inventory/:productId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { stock, lowStockThreshold } = req.body;
    const productId = req.params.productId as string;
    const updated = await prisma.inventory.upsert({ where: { productId }, update: { ...(stock !== undefined && { stock }), ...(lowStockThreshold !== undefined && { lowStockThreshold }) }, create: { productId, stock: stock || 0, lowStockThreshold: lowStockThreshold || 5 } });
    sendSuccess(res, updated, 'Inventory updated');
  } catch (error) { next(error); }
});

router.use('/admin', adminRouter);

export default router;

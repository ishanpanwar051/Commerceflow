import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categorySchema, updateCategorySchema } from '../validators';
import { cache } from '../middleware/cache';

const router = Router();
const controller = new CategoryController();

router.get('/', cache(60), controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));

router.post('/', authenticate, authorize('ADMIN'), validate(categorySchema), controller.create.bind(controller));
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), controller.update.bind(controller));
router.delete('/:id', authenticate, authorize('ADMIN'), controller.delete.bind(controller));

export default router;

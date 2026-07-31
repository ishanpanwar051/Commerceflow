import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/product';
import { cache } from '../middleware/cache';

const router = Router();
const controller = new ProductController();

router.get('/', validate(productQuerySchema, 'query'), cache(30), controller.getProducts.bind(controller));
router.get('/search', cache(30), controller.searchProducts.bind(controller));
router.get('/:idOrSlug', cache(30), controller.getProduct.bind(controller));

router.post('/', authenticate, authorize('ADMIN'), validate(createProductSchema), controller.createProduct.bind(controller));
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateProductSchema), controller.updateProduct.bind(controller));
router.delete('/:id', authenticate, authorize('ADMIN'), controller.deleteProduct.bind(controller));

router.post('/:id/images', authenticate, authorize('ADMIN'), controller.addImage.bind(controller));
router.delete('/:id/images/:imageId', authenticate, authorize('ADMIN'), controller.deleteImage.bind(controller));

export default router;

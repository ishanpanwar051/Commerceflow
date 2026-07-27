import { Router } from 'express';
import { ChurnController } from '../controllers/churnController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new ChurnController();

router.get('/predictions', authenticate, authorize('ADMIN'), controller.getPredictions.bind(controller));

export default router;

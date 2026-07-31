import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();
const controller = new HealthController();

// Liveness probe - Always returns 200 if app is running
router.get('/live', controller.liveness.bind(controller));

// Readiness probe - Returns 200 if app can serve traffic
router.get('/ready', controller.readiness.bind(controller));

// Full health check with all dependencies
router.get('/', controller.health.bind(controller));

// Metrics endpoint for monitoring
router.get('/metrics', controller.metrics.bind(controller));

export default router;

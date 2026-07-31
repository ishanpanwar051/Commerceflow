import { Router, Request, Response } from 'express';
import { getMetrics } from '../config/metrics';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error collecting metrics');
  }
});

export default router;

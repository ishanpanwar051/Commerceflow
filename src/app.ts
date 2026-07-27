import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { timeout } from './middleware/timeout';
import { swaggerSpec } from './config/swagger';
import { metricsMiddleware } from './config/metrics';
import router from './routes';
import { AuthRequest } from './types';

const allowedCorsOrigins = (process.env.CORS_ORIGIN?.split(',') || [config.frontendUrl]).filter(Boolean);

const app = express();

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedCorsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    if (req.path?.includes('webhook')) {
      req.rawBody = buf.toString();
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestIdMiddleware);
app.use(metricsMiddleware);

app.use(timeout(30000));

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Vitest applies its NODE_ENV after some modules have been evaluated. Checking
// at request time prevents the production in-memory store from leaking into
// integration tests while retaining rate limiting for every deployed request.
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return next();
  return apiLimiter(req, res, next);
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug({ req: { method: req.method, url: req.url, requestId: (req as AuthRequest).requestId } }, 'Incoming request');
  next();
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'CommerceFlow API',
    version: '1.0.0',
    docs: '/api/v1/docs',
    health: '/api/v1/health',
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

export { app };

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
import { sanitizeInput, preventAttacks, securityHeaders, validateContentLength, bruteForceProtection } from './middleware/security';
import { swaggerSpec } from './config/swagger';
import { metricsMiddleware } from './config/metrics';
import router from './routes';
import healthRoutes from './routes/healthRoutes';
import { AuthRequest } from './types';

const allowedCorsOrigins = (process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || [config.frontendUrl]).filter(Boolean);

const app = express();

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Security middleware - order matters
app.use(helmet({
  contentSecurityPolicy: config.isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(securityHeaders);
app.use(preventAttacks);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedCorsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(compression());

// Body parsing - must come before other middleware that reads body
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    if (req.path?.includes('webhook')) {
      req.rawBody = buf.toString();
    }
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Request identification and monitoring
app.use(requestIdMiddleware);
app.use(metricsMiddleware);
app.use(validateContentLength);
app.use(bruteForceProtection);

// Timeout middleware - 30s for dev, 10s for prod
app.use(timeout(config.isProd ? 10000 : 30000));

// Rate limiting - skip for test environment and health checks
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/v1/health'),
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) return next();
  return apiLimiter(req, res, next);
});

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug({ req: { method: req.method, url: req.url, requestId: (req as AuthRequest).requestId } }, 'Incoming request');
  next();
});

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/v1', router);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'CommerceFlow API',
    version: '1.0.0',
    docs: '/api/v1/docs',
    health: '/api/v1/health',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// Error handler
app.use(errorHandler);

export { app };

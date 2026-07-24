import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const productionAuthLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Too many attempts. Please try again after 15 minutes.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

const productionForgotPasswordLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 3,
      message: {
        success: false,
        message: 'Too many password reset requests. Please try again after 15 minutes.',
        code: 'RESET_RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

const productionPaymentLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 10,
      message: {
        success: false,
        message: 'Too many payment requests. Please try again later.',
        code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

/**
 * Vitest sets NODE_ENV after modules may have been loaded by a test file.
 * Check it at request time so tests never accidentally retain a production
 * in-memory bucket and become order-dependent.
 */
function useLimiterInCurrentEnvironment(
  limiter: ReturnType<typeof rateLimit>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) return next();
    return limiter(req, res, next);
  };
}

export const authLimiter = useLimiterInCurrentEnvironment(productionAuthLimiter);
export const forgotPasswordLimiter = useLimiterInCurrentEnvironment(productionForgotPasswordLimiter);
export const paymentLimiter = useLimiterInCurrentEnvironment(productionPaymentLimiter);

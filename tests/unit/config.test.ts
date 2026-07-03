import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

describe('Environment Schema', () => {
  it('should validate correct config', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    });

    expect(result.success).toBe(true);
  });

  it('should reject short JWT secret', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'short',
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    });

    expect(result.success).toBe(false);
  });

  it('should apply defaults', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-jwt-secret-minimum-32-characters-long',
      STRIPE_SECRET_KEY: 'sk_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
      expect(result.data.NODE_ENV).toBe('development');
    }
  });
});

describe('Job Types', () => {
  it('should define all required job names', async () => {
    const { JobName } = await import('../src/queues/types');

    expect(JobName.ORDER_CONFIRMATION_EMAIL).toBe('order-confirmation-email');
    expect(JobName.INVOICE_GENERATION).toBe('invoice-generation');
    expect(JobName.PAYMENT_CONFIRMATION).toBe('payment-confirmation');
    expect(JobName.LOW_STOCK_NOTIFICATION).toBe('low-stock-notification');
    expect(JobName.WELCOME_EMAIL).toBe('welcome-email');
    expect(JobName.PASSWORD_RESET_EMAIL).toBe('password-reset-email');
    expect(JobName.EMAIL_VERIFICATION).toBe('email-verification');
    expect(JobName.COUPON_EXPIRATION).toBe('coupon-expiration');
    expect(JobName.PRODUCT_IMAGE_PROCESSING).toBe('product-image-processing');
  });
});

describe('Queue Configuration', () => {
  it('should have retry with exponential backoff', async () => {
    const { DEFAULT_JOB_OPTIONS } = await import('../src/queues/types');

    expect(DEFAULT_JOB_OPTIONS.attempts).toBe(5);
    expect(DEFAULT_JOB_OPTIONS.backoff.type).toBe('exponential');
    expect(DEFAULT_JOB_OPTIONS.backoff.delay).toBe(1000);
  });
});

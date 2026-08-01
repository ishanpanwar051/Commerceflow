

import { z } from 'zod';



const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string(),
  DATABASE_POOL_URL: z.string().optional(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.coerce.boolean().default(false),
  REDIS_TLS_CA: z.string().optional(),
  REDIS_TLS_CERT: z.string().optional(),
  REDIS_TLS_KEY: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@commerceflow.dev'),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  GOOGLE_CLIENT_ID: z.string().optional(),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Logger may not be initialized yet, but we need structured output
  console.error(JSON.stringify({
    level: 'fatal',
    msg: 'Invalid environment variables',
    errors: parsed.error.flatten().fieldErrors,
  }));
  process.exit(1);
}

const fallbackAccess = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPp1';
const fallbackRefresh = 'ZzYyXxWwVvUuTtSsRrQqPpOoNnMmLlKk2';

if (parsed.data.NODE_ENV === 'production' && (!parsed.data.JWT_ACCESS_SECRET || !parsed.data.JWT_REFRESH_SECRET)) {
  console.error(JSON.stringify({
    level: 'fatal',
    msg: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required in production (insecure fallbacks refused)',
  }));
  process.exit(1);
}

export const config = {
  env: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  host: parsed.data.HOST,
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',

  database: {
    url: parsed.data.DATABASE_URL,
    poolUrl: parsed.data.DATABASE_POOL_URL,
  },

  redis: {
    host: parsed.data.REDIS_HOST,
    port: parsed.data.REDIS_PORT,
    password: parsed.data.REDIS_PASSWORD,
    tlsEnabled: parsed.data.REDIS_TLS_ENABLED,
    tlsCa: parsed.data.REDIS_TLS_CA,
    tlsCert: parsed.data.REDIS_TLS_CERT,
    tlsKey: parsed.data.REDIS_TLS_KEY,
    url: parsed.data.REDIS_PASSWORD
      ? `redis://:${parsed.data.REDIS_PASSWORD}@${parsed.data.REDIS_HOST}:${parsed.data.REDIS_PORT}`
      : `redis://${parsed.data.REDIS_HOST}:${parsed.data.REDIS_PORT}`,
  },

  jwt: {
    accessSecret: parsed.data.JWT_ACCESS_SECRET || fallbackAccess,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET || fallbackRefresh,
    accessExpiresIn: parsed.data.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },

  stripe: {
    secretKey: parsed.data.STRIPE_SECRET_KEY,
    webhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
  },

  cloudinary: {
    cloudName: parsed.data.CLOUDINARY_CLOUD_NAME,
    apiKey: parsed.data.CLOUDINARY_API_KEY,
    apiSecret: parsed.data.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parsed.data.SMTP_PORT,
    user: parsed.data.SMTP_USER,
    pass: parsed.data.SMTP_PASS,
    from: parsed.data.EMAIL_FROM,
  },

  frontendUrl: parsed.data.FRONTEND_URL,

  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    max: parsed.data.RATE_LIMIT_MAX,
  },

  google: {
    clientId: parsed.data.GOOGLE_CLIENT_ID,
  },

  logging: {
    level: parsed.data.LOG_LEVEL,
  },
} as const;

export type Config = typeof config;

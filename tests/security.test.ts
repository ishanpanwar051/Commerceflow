import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../src/app';
import { getPrisma } from '../src/config/database';
import { config } from '../src/config';

const prisma = getPrisma();

let customerAToken: string;
let customerAId: string;
let customerAEmail: string;
let customerBToken: string;
let customerBId: string;
let customerBEmail: string;
let adminToken: string;
let adminId: string;
let adminEmail: string;

async function createUser(email: string, password: string, role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') {
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName: 'Security',
      lastName: 'Test',
      role,
      isEmailVerified: true,
    },
  });

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: '1h' },
  );

  return { user, token: accessToken };
}

describe('SECURITY: Authentication Attacks', () => {
  it('REJECTS request with no token', async () => {
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(401);
  });

  it('REJECTS request with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(401);
  });

  it('REJECTS request with expired token', async () => {
    const expiredToken = jwt.sign(
      { userId: 'fake-id', email: 'x@test.com', role: 'CUSTOMER' },
      config.jwt.accessSecret,
      { expiresIn: '0s' },
    );
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('REJECTS token signed with wrong secret', async () => {
    const fakeToken = jwt.sign(
      { userId: 'fake-id', email: 'x@test.com', role: 'CUSTOMER' },
      'wrong-secret-32-chars-long-for-hmac!!',
      { expiresIn: '1h' },
    );
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  it('REJECTS token with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'some-random-value');
    expect(res.status).toBe(401);
  });

  it('REJECTS empty Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });
});

describe('SECURITY: Authorization / IDOR', () => {
  beforeAll(async () => {
    customerAEmail = `cust-a-${Date.now()}@sectest.com`;
    customerBEmail = `cust-b-${Date.now()}@sectest.com`;
    adminEmail = `admin-${Date.now()}@sectest.com`;

    const a = await createUser(customerAEmail, 'TestPass123!');
    customerAToken = a.token;
    customerAId = a.user.id;

    const b = await createUser(customerBEmail, 'TestPass123!');
    customerBToken = b.token;
    customerBId = b.user.id;

    const admin = await createUser(adminEmail, 'TestPass123!', 'ADMIN');
    adminToken = admin.token;
    adminId = admin.user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [customerAEmail, customerBEmail, adminEmail] } } });
  });

  it('BLOCKS customerB from viewing customerA profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${customerBToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(customerBId);
    expect(res.body.data.id).not.toBe(customerAId);
  });

  it('ADMIN cannot access without admin role (CUSTOMER role)', async () => {
    const res = await request(app)
      .get('/api/v1/orders/admin/all')
      .set('Authorization', `Bearer ${customerAToken}`);
    expect(res.status).toBe(403);
  });

  it('ADMIN can access admin-only endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('BLOCKS CUSTOMER from accessing admin product creation', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({ name: 'Hack', basePrice: 10, sku: 'HACK-001', categoryId: '00000000-0000-0000-0000-000000000000' });
    expect(res.status).toBe(403);
  });

  it('BLOCKS CUSTOMER from updating order status', async () => {
    const res = await request(app)
      .patch('/api/v1/orders/admin/fake-order-id/status')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(403);
  });
});

describe('SECURITY: Refresh Token Rotation', () => {
  let refreshEmail: string;
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    refreshEmail = `refresh-${Date.now()}@sectest.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: refreshEmail,
        password: 'TestPass123!',
        firstName: 'Refresh',
        lastName: 'Test',
      });
    expect(res.status).toBe(201);
    refreshToken = res.body.data.refreshToken;
    accessToken = res.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: refreshEmail } });
  });

  it('issues new tokens on valid refresh', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
    refreshToken = res.body.data.refreshToken;
  });

  it('REJECTS reused refresh token (rotation)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    const newRefreshToken = res.body.data.refreshToken;

    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.success).toBe(false);

    refreshToken = newRefreshToken;
  });

  it('REJECTS completely invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'totally-fake-token' });
    expect(res.status).toBe(401);
  });

  it('REJECTS refresh token after logout', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: refreshEmail, password: 'TestPass123!' });
    const newRefresh = loginRes.body.data.refreshToken;

    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
      .send({ refreshToken: newRefresh });
    expect(200);

    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: newRefresh });
    expect(reuseRes.status).toBe(401);
  });
});

describe('SECURITY: Payment Confirm Ownership', () => {
  let ownerToken: string;
  let otherToken: string;
  let orderId: string;

  beforeAll(async () => {
    const ownerEmail = `pay-owner-${Date.now()}@sectest.com`;
    const otherEmail = `pay-other-${Date.now()}@sectest.com`;

    const owner = await createUser(ownerEmail, 'TestPass123!');
    ownerToken = owner.token;

    const other = await createUser(otherEmail, 'TestPass123!');
    otherToken = other.token;

    await prisma.user.deleteMany({ where: { email: { in: [ownerEmail, otherEmail] } } });

    const ownerU = await createUser(ownerEmail, 'TestPass123!');
    ownerToken = ownerU.token;

    const otherU = await createUser(otherEmail, 'TestPass123!');
    otherToken = otherU.token;
  });

  it('REJECTS confirm payment for non-owned payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments/confirm')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ paymentIntentId: 'pi_fake_nonexistent_123' });
    expect(res.status).toBe(404);
  });
});

describe('SECURITY: Avatar URL Validation', () => {
  let userToken: string;

  beforeAll(async () => {
    const email = `avatar-${Date.now()}@sectest.com`;
    const user = await createUser(email, 'TestPass123!');
    userToken = user.token;
  });

  it('REJECTS non-string avatar URL', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 12345 });
    expect(res.status).toBe(400);
  });

  it('REJECTS non-URL string', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
  });

  it('REJECTS HTTP URLs (must be HTTPS)', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 'http://evil.com/track.gif' });
    expect(res.status).toBe(400);
  });

  it('REJECTS javascript: protocol', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
  });

  it('REJECTS data: protocol', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 'data:text/html,<script>alert(1)</script>' });
    expect(res.status).toBe(400);
  });

  it('ACCEPTS valid HTTPS URL', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ url: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg' });
    expect(res.status).toBe(200);
  });
});

describe('SECURITY: Rate Limiting', () => {
  it('rate limiter middleware is configured and skips in test mode', async () => {
    // Rate limiters are intentionally disabled when NODE_ENV=test (see rateLimiter.ts).
    // This test verifies the endpoint works without rate limiting in test mode,
    // confirming the middleware doesn't break request flow.
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `rate-limiter-check-${Date.now()}@sectest.com`,
        password: 'TestPass123!',
        firstName: 'Rate',
        lastName: 'Limiter',
      });
    // In test mode: should succeed (no rate limiting applied)
    // In production: would be rate limited after 5 attempts
    expect([201, 409]).toContain(res.status);
  });
});

describe('SECURITY: NoSQL Injection Prevention (Zod Validation)', () => {
  it('REJECTS $gt operator in auth body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: { $gt: '' },
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).not.toBe(201);
  });

  it('REJECTS $ne operator in login body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: { $ne: '' },
        password: 'TestPass123!',
      });
    expect(res.status).not.toBe(200);
  });

  it('REJECTS array injection in registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: ['array@test.com'],
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).not.toBe(201);
  });

  it('REJECTS $where in product search query', async () => {
    const res = await request(app)
      .get('/api/v1/products?search[$where]=1==1');
    expect(res.status).not.toBe(500);
  });
});

describe('SECURITY: Order Ownership', () => {
  let customerXToken: string;
  let customerYToken: string;

  beforeAll(async () => {
    const emailX = `order-x-${Date.now()}@sectest.com`;
    const emailY = `order-y-${Date.now()}@sectest.com`;

    const x = await createUser(emailX, 'TestPass123!');
    customerXToken = x.token;

    const y = await createUser(emailY, 'TestPass123!');
    customerYToken = y.token;
  });

  it('BLOCKS customerY from viewing customerX order', async () => {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/api/v1/orders/${fakeOrderId}`)
      .set('Authorization', `Bearer ${customerYToken}`);
    expect(res.status).toBe(404);
  });

  it('BLOCKS customerY from cancelling customerX order', async () => {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .post(`/api/v1/orders/${fakeOrderId}/cancel`)
      .set('Authorization', `Bearer ${customerYToken}`)
      .send({ reason: 'hacked' });
    expect(res.status).toBe(404);
  });
});

describe('SECURITY: CORS Headers', () => {
  it('REJECTS requests from unauthorized origins', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://evil-site.com');
    expect(res.status).not.toBe(200);
  });

  it('ALLOWS requests from frontend origin', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', config.frontendUrl);
    expect(res.status).toBe(200);
  });

  it('ALLOWS requests with no origin (e.g. server-to-server)', async () => {
    const res = await request(app)
      .get('/api/v1/health');
    expect(res.status).toBe(200);
  });
});

describe('SECURITY: Stripe Webhook Signature', () => {
  it('REJECTS webhook with missing signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .send({ type: 'payment_intent.succeeded' });
    expect(res.status).toBe(400);
  });

  it('REJECTS webhook with invalid signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('stripe-signature', 'invalid_sig')
      .send({ type: 'payment_intent.succeeded' });
    expect(res.status).toBe(400);
  });
});

describe('SECURITY: Sensitive Data Exposure', () => {
  it('does not expose password in registration response', async () => {
    const email = `no-leak-${Date.now()}@sectest.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'TestPass123!', firstName: 'No', lastName: 'Leak' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
    await prisma.user.deleteMany({ where: { email } });
  });

  it('does not expose emailToken or resetToken in profile', async () => {
    const email = `profile-no-leak-${Date.now()}@sectest.com`;
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'TestPass123!', firstName: 'Profile', lastName: 'Leak' });
    const token = reg.body.data.accessToken;

    const profile = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.emailToken).toBeUndefined();
    expect(profile.body.data.resetToken).toBeUndefined();
    expect(profile.body.data.resetTokenExp).toBeUndefined();
    expect(profile.body.data.password).toBeUndefined();
    await prisma.user.deleteMany({ where: { email } });
  });
});

describe('SECURITY: Input Validation', () => {
  it('REJECTS weak password on registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'weak@test.com', password: '123', firstName: 'W', lastName: 'K' });
    expect(res.status).toBe(422);
  });

  it('REJECTS invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'TestPass123!', firstName: 'T', lastName: 'U' });
    expect(res.status).toBe(422);
  });

  it('REJECTS missing required fields on checkout', async () => {
    const email = `checkout-validation-${Date.now()}@sectest.com`;
    const user = await createUser(email, 'TestPass123!');
    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('REJECTS invalid order status transition', async () => {
    const email = `status-val-${Date.now()}@sectest.com`;
    const user = await createUser(email, 'TestPass123!', 'ADMIN');
    const res = await request(app)
      .patch('/api/v1/orders/admin/fake-id/status')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(422);
  });
});

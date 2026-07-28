import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { getPrisma } from '../src/config/database';

const prisma = getPrisma();

describe('Auth API', () => {
  const testUser = {
    email: 'test-auth@example.com',
    password: 'TestPass123!',
    firstName: 'Auth',
    lastName: 'Test',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: ['test-auth@example.com', 'test-login@example.com'] } } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: ['test-auth@example.com', 'test-login@example.com'] } } });
  });

  it('POST /api/v1/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/register - should reject duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/auth/register - should reject weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...testUser, email: 'weak@example.com', password: '123' });
    expect(res.status).toBe(422);
  });

  it('POST /api/v1/auth/login - should login successfully', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/login - should reject wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/login - should reject non-existent email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'noone@example.com', password: 'TestPass123' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/refresh - should refresh token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: login.body.data.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/refresh - should reject invalid refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'invalid-token' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/auth/logout - should logout', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${login.body.data.accessToken}`).send({});
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/auth/forgot-password - should accept valid email', async () => {
    const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: testUser.email });
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/auth/change-password - should change password', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await request(app).post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ currentPassword: testUser.password, newPassword: 'NewPass123!' });
    expect(res.status).toBe(200);
    await request(app).post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ currentPassword: 'NewPass123!', newPassword: testUser.password });
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(401);
  });
});

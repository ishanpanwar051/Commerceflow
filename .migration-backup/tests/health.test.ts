import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Health API', () => {
  it('GET /api/v1/health - should return ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
  });

  it('GET /api/v1/health/live - should return alive', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  it('GET /api/v1/health/ready - should return status with checks', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body.checks).toBeDefined();
    expect(res.body.checks.database).toBeDefined();
    expect(res.body.checks.redis).toBeDefined();
  });

  it('GET / - should return api info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('CommerceFlow API');
  });

  it('GET /nonexistent - should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});

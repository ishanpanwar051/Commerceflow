import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app';
import { getPrisma } from '../src/config/database';

const prisma = getPrisma();

describe('Product API', () => {
  let categoryId: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { email: 'test-admin@example.com' },
      update: { password: await bcrypt.hash('Admin123', 12), role: 'ADMIN', isActive: true, deletedAt: null },
      create: { email: 'test-admin@example.com', password: await bcrypt.hash('Admin123', 12), firstName: 'Test', lastName: 'Admin', role: 'ADMIN', isEmailVerified: true },
    });
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'test-admin@example.com', password: 'Admin123' });
    adminToken = login.body.data.accessToken;

    const cat = await prisma.category.create({ data: { name: 'Test Category', slug: 'test-category-' + Date.now() } });
    categoryId = cat.id;
  });

  afterAll(async () => {
    const categories = await prisma.category.findMany({
      where: { slug: { startsWith: 'test-category-' } },
      select: { id: true },
    });
    const categoryIds = categories.map((category) => category.id);
    if (categoryIds.length) {
      await prisma.productImage.deleteMany({ where: { product: { categoryId: { in: categoryIds } } } });
      await prisma.inventory.deleteMany({ where: { product: { categoryId: { in: categoryIds } } } });
      await prisma.product.deleteMany({ where: { categoryId: { in: categoryIds } } });
      await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
    }
    await prisma.user.deleteMany({ where: { email: 'test-admin@example.com' } });
  });

  it('GET /api/v1/products - should list products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/products - should paginate', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
  });

  it('POST /api/v1/products - admin should create product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Product', basePrice: 29.99, sku: `SKU-${Date.now()}`, categoryId, stock: 100 });
    expect(res.status).toBe(201);
    productId = res.body.data.id;
  });

  it('POST /api/v1/products - non-admin should be rejected', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Test Product 2', basePrice: 19.99, sku: `SKU-${Date.now() + 1}`, categoryId });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/products/:id - should get product by id', async () => {
    if (!productId) return;
    const res = await request(app).get(`/api/v1/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Product');
  });

  it('GET /api/v1/products/:id - should return 404 for non-existent', async () => {
    const res = await request(app).get('/api/v1/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/v1/products/:id - admin should update product', async () => {
    if (!productId) return;
    const res = await request(app)
      .patch(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Product' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/v1/products/:id - admin should delete product', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

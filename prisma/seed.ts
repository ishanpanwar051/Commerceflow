import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@commerceflow.dev' },
    update: {},
    create: {
      email: 'admin@commerceflow.dev',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CUSTOMER,
      isEmailVerified: true,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
  });

  const products = [
    { name: 'Wireless Headphones', slug: 'wireless-headphones', basePrice: 79.99, sku: 'WH-001', categoryId: electronics.id, stock: 50 },
    { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', basePrice: 49.99, sku: 'BS-001', categoryId: electronics.id, stock: 30 },
    { name: 'USB-C Hub', slug: 'usb-c-hub', basePrice: 34.99, sku: 'UC-001', categoryId: electronics.id, stock: 100 },
    { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', basePrice: 19.99, sku: 'CT-001', categoryId: clothing.id, stock: 200 },
    { name: 'Denim Jacket', slug: 'denim-jacket', basePrice: 89.99, sku: 'DJ-001', categoryId: clothing.id, stock: 25 },
  ];

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          basePrice: product.basePrice,
          sku: product.sku,
          categoryId: product.categoryId,
          inventory: { create: { stock: product.stock, lowStockThreshold: 5 } },
        },
      });
    }
  }

  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off your first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscount: 50,
      usageLimit: 100,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seed completed successfully');
  console.log(`Admin: admin@commerceflow.dev / Admin@123`);
  console.log(`Customer: customer@example.com / Admin@123`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

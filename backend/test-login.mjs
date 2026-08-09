import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg('postgresql://postgres:postgres@127.0.0.1:5432/commerceflow_dev');
const p = new PrismaClient({ adapter });

async function test() {
  const u = await p.user.findFirst({ where: { email: 'customer@example.com' } });
  console.log('User found:', u?.email, 'Active:', u?.isActive, 'Role:', u?.role);
  const match = await bcrypt.compare('Admin@123', u.password);
  console.log('Password Match for Admin@123:', match);
  await p.$disconnect();
}

test().catch(console.error);

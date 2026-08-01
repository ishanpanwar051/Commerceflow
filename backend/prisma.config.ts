import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrate: {
    async adapter() {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required for Prisma migrations');
      }
      const pool = new Pool({ connectionString });
      return new PrismaPg(pool);
    },
  },
});

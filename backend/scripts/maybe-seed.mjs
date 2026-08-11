#!/usr/bin/env node
// Seeds the database only when it is empty (no users yet).
// Runs the pre-bundled seed script as a child process so its exit code is reliable.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[maybe-seed] DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 });

try {
  const { rows } = await pool.query('SELECT count(*)::int AS c FROM users');
  if (rows[0].c > 0) {
    console.log('[maybe-seed] database already has users, skipping seed');
    await pool.end().catch(() => {});
    process.exit(0);
  }
  const { rows: pRows } = await pool.query('SELECT count(*)::int AS c FROM products');
  if (pRows[0].c > 0) {
    console.log('[maybe-seed] database already has products, skipping seed');
    await pool.end().catch(() => {});
    process.exit(0);
  }
} catch (err) {
  console.error('[maybe-seed] could not check users table:', err && err.message ? err.message : String(err));
  await pool.end().catch(() => {});
  process.exit(1);
}
await pool.end().catch(() => {});

const seedPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'seed.mjs');
console.log('[maybe-seed] database is empty, seeding...');

const child = spawn(process.execPath, [seedPath], { stdio: 'inherit' });

child.on('error', (err) => {
  console.error('[maybe-seed] failed to spawn seed:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('[maybe-seed] seed completed successfully');
    process.exit(0);
  }
  console.error(`[maybe-seed] seed failed with exit code ${code}`);
  process.exit(code || 1);
});

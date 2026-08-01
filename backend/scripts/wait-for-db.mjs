#!/usr/bin/env node
// Waits for PostgreSQL to accept connections before migrations are applied.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[wait-for-db] DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
const deadline = Date.now() + 120_000;

while (Date.now() < deadline) {
  try {
    await pool.query('SELECT 1');
    console.log('[wait-for-db] database is ready');
    await pool.end().catch(() => {});
    process.exit(0);
  } catch (err) {
    const code = err && err.code ? err.code : err && err.message ? err.message : String(err);
    console.log(`[wait-for-db] database not ready (${code}), retrying in 2s...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

console.error('[wait-for-db] database did not become ready within 120 seconds');
process.exit(1);

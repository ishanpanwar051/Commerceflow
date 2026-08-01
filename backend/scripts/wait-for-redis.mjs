#!/usr/bin/env node
// Waits for Redis to accept TCP connections before the API starts.
// Non-fatal: the app degrades gracefully (no caching/queues) when Redis is
// unavailable, so we exit 0 even if the deadline is reached.
import net from 'node:net';

const host = process.env.REDIS_HOST || 'redis';
const port = Number(process.env.REDIS_PORT || 6379);
const deadline = Date.now() + 30_000;

function tryConnect() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host, port }, () => {
      socket.end();
      resolve();
    });
    socket.setTimeout(3000);
    socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
    socket.on('error', reject);
  });
}

while (Date.now() < deadline) {
  try {
    await tryConnect();
    console.log('[wait-for-redis] redis is reachable');
    process.exit(0);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.log(`[wait-for-redis] redis not ready (${msg}), retrying in 2s...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

console.warn('[wait-for-redis] redis did not become reachable within 30s — continuing (app degrades gracefully)');
process.exit(0);

#!/bin/sh
set -eu

echo "[entrypoint] Waiting for PostgreSQL to become reachable..."
node ./scripts/wait-for-db.mjs

# Redis is optional at runtime (the app degrades gracefully without it), but we
# still wait briefly so caches/queues are ready when the server starts.
echo "[entrypoint] Waiting for Redis to become reachable..."
node ./scripts/wait-for-redis.mjs || echo "[entrypoint] Redis not reachable — continuing (app degrades gracefully)"

echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
./node_modules/.bin/prisma migrate deploy

if [ "${SEED_DB:-true}" = "true" ]; then
  echo "[entrypoint] Checking whether the database needs seeding..."
  node ./scripts/maybe-seed.mjs
fi

# Idempotent image sync: guarantees category images + exactly 4 images per
# product with unique primaries, even on databases seeded before the fix.
echo "[entrypoint] Syncing product & category images..."
node ./dist/update-images.mjs

echo "[entrypoint] Starting CommerceFlow API..."
exec node --enable-source-maps ./dist/index.mjs

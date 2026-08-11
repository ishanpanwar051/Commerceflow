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

# Seeding is OFF by default. It must be explicitly enabled (SEED_DB=true) for a
# fresh database. The seed script WIPES ALL EXISTING DATA, so it must never run
# automatically against a live database.
if [ "${SEED_DB:-false}" = "true" ]; then
  echo "[entrypoint] Checking whether the database needs seeding..."
  node ./scripts/maybe-seed.mjs
fi


echo "[entrypoint] Starting CommerceFlow API..."
exec node --enable-source-maps ./dist/index.mjs

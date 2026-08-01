# syntax=docker/dockerfile:1
# ============================================================================
# CommerceFlow — multi-stage Docker build
#   target  backend-runtime   → Express API server (Node 24, non-root, healthchecked)
#   target  frontend-runtime  → Vite SPA served by nginx (non-root, healthchecked)
#
# Everything is built from a frozen pnpm lockfile. The Prisma client is
# generated at build time and a baseline PostgreSQL migration is produced from
# the schema with `prisma migrate diff` (no database required during build).
# Migrations are applied automatically by `prisma migrate deploy` in the
# container entrypoint once PostgreSQL is healthy.
# ============================================================================

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    npm_config_user_agent="pnpm/11.1.0"
WORKDIR /app
RUN npm install --global pnpm@11.1.0

# ---------------------------------------------------------------------------
# deps — install the full workspace, then deploy the API server's production
#         dependency tree into a self-contained /app/runtime directory.
#         `--legacy` is required because pnpm v10+ only deploys without
#         `inject-workspace-packages` under the legacy deploy algorithm.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY mockup-sandbox/package.json mockup-sandbox/package.json
COPY scripts/package.json scripts/package.json
COPY lib/db/package.json lib/db/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
# Cached pnpm store speeds up rebuilds when dependency files change.
# --store-dir places the store on the cache mount (a separate filesystem, so
# pnpm copies instead of hard-linking — node_modules stays self-contained and
# works in later RUN steps even though the cache mount is ephemeral).
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
RUN pnpm --filter @workspace/api-server deploy --prod --legacy /app/runtime

# ---------------------------------------------------------------------------
# builder — generate the Prisma client + a baseline migration, then bundle the
#           backend and build the frontend production bundle.
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/.npmrc ./.npmrc
COPY . .

# Injected into the Vite build (must be a full URL or an absolute path such as
# /api/v1 when served behind the bundled nginx reverse proxy).
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

# Optional frontend integrations (Stripe checkout, Firebase/Google auth).
# Only passed through if provided — the frontend degrades gracefully when unset.
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY} \
    VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
    VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
    VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
    VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET} \
    VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID} \
    VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}

# Prisma client (works offline — the driver adapter reads DATABASE_URL lazily)
RUN pnpm --filter @workspace/api-server exec prisma generate

# Baseline migration from an empty database (no DB connection required).
# `pnpm --filter <pkg> exec` runs with the package directory as its CWD, so all
# paths below are relative to /app/backend.
RUN mkdir -p /app/backend/prisma/migrations/00000000000000_init \
    && pnpm --filter @workspace/api-server exec prisma migrate diff \
       --from-empty --to-schema ./prisma/schema.prisma --script \
       --output ./prisma/migrations/00000000000000_init/migration.sql

# Backend bundle (dist/index.mjs + dist/seed.mjs)
RUN pnpm --filter @workspace/api-server run build

# Frontend production bundle (frontend/dist/public)
RUN pnpm --filter @workspace/commerce-flow run build

# ---------------------------------------------------------------------------
# backend-runtime
# ---------------------------------------------------------------------------
FROM base AS backend-runtime
ENV NODE_ENV="production" \
    PORT="4000" \
    HOST="0.0.0.0"
WORKDIR /app/runtime

COPY --from=deps /app/runtime /app/runtime
COPY --from=builder /app/backend/dist /app/runtime/dist
COPY --from=builder /app/backend/prisma /app/runtime/prisma
COPY --from=builder /app/backend/prisma.config.ts /app/runtime/prisma.config.ts
COPY --from=builder /app/backend/scripts /app/runtime/scripts
COPY --from=builder /app/backend/docker-entrypoint.sh /app/runtime/docker-entrypoint.sh

# Generate the Prisma client into the runtime node_modules
RUN ./node_modules/.bin/prisma generate

RUN chmod +x /app/runtime/docker-entrypoint.sh \
    && mkdir -p /app/runtime/uploads \
    && chown -R node:node /app/runtime

USER node
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=6 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

# ---------------------------------------------------------------------------
# frontend-runtime — nginx serving the SPA + reverse-proxying /api → backend
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS frontend-runtime
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist/public /app/dist/public

RUN mkdir -p /tmp/nginx-body /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi \
    && chown -R nginx:nginx /app/dist \
       /tmp/nginx-body /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

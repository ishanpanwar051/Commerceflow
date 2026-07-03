# CommerceFlow — Production-Grade E-Commerce Backend

[![CI/CD](https://github.com/YOUR_USERNAME/commerceflow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/commerceflow/actions/workflows/ci.yml)

Scalable e-commerce backend built with TypeScript, Express, PostgreSQL, Redis, BullMQ, and Stripe. Designed for FAANG-level engineering standards.

## Features

- **Auth**: JWT + refresh token rotation, bcrypt, email verification, forgot/reset password
- **Products**: Full CRUD, pagination, search, filtering (category, price, rating), Redis caching
- **Cart**: Add/remove/update items, coupon application
- **Orders**: Checkout with Stripe payments, status workflow (PENDING → REFUNDED), inventory management
- **Background Jobs**: BullMQ workers for emails, invoice PDFs, notifications — with retry, DLQ, exponential backoff
- **Payment Idempotency**: Duplicate-safe Stripe webhook processing
- **Observability**: Pino structured logging, request IDs, health checks (live/ready), Prometheus metrics
- **Security**: Helmet, CORS, rate limiting, SQL injection protection, JWT auth
- **Docker**: Multi-stage builds, docker-compose with nginx reverse proxy
- **CI/CD**: GitHub Actions — lint, typecheck, test, build, Docker

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22, TypeScript |
| Framework | Express.js |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7 (ioredis) |
| Queue | BullMQ |
| Payments | Stripe |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest, Supertest |
| CI/CD | GitHub Actions |
| Container | Docker, docker-compose |

## Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/commerceflow.git
cd commerceflow
npm install
npx prisma generate

# Start infrastructure
docker compose up -d postgres redis

# Copy env and migrate
cp env/.env.development .env
npm run db:migrate
npm run db:seed

# Start API
npm run dev
# Start worker (in another terminal)
npm run dev:worker
```

## Docker

```bash
docker compose up --build
```

## API Endpoints

Base: `http://localhost:4000/api/v1`

See [API Design](docs/api-design.md) for complete endpoint reference.

## Project Structure

```
src/
├── config/       - App config, database, redis, logger
├── controllers/  - Route handlers
├── services/     - Business logic
├── repositories/ - Data access layer
├── middleware/    - Auth, validation, cache, idempotency
├── routes/       - Express routers
├── validators/   - Zod schemas
├── workers/      - BullMQ job processors
├── types/        - TypeScript types
├── utils/        - Helpers, error classes
├── app.ts        - Express app setup
└── server.ts     - Entry point
```

## Environment Variables

See `env/.env.development` for reference.

Key variables: `DATABASE_URL`, `REDIS_HOST`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`.

## Architecture

See [Architecture Docs](docs/architecture.md) for C4 diagrams, request lifecycle, and deployment architecture.

## License

MIT

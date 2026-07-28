# Complete Backend Learning Roadmap

## Target: FAANG-level Backend Engineer (6-8 months)

---

## Phase 0: Setup & Mindset (Week 1)

- [ ] Install: Node.js v22+, VS Code, Git, Docker Desktop, PostgreSQL, Redis
- [ ] GitHub account + SSH setup
- [ ] TypeScript basics (types, interfaces, generics, enums)
- [ ] npm vs yarn vs pnpm

**Resource:** TypeScript Handbook (official, 2-3 days)

---

## Phase 1: JavaScript/TypeScript Deep Dive (Weeks 2-3)

**Topics:**
- [ ] Async/await, Promises, Event Loop
- [ ] Closures, Prototypes, `this` keyword
- [ ] ES6+ features (destructuring, spread, modules)
- [ ] TypeScript: utility types, generics, discriminated unions
- [ ] Error handling (try/catch, custom errors)

**Mini Project:** CLI tool (e.g., file renamer, todo CLI) in TypeScript

**Resource:** `src/utils/errors.ts` in CommerceFlow — custom error classes dekho

---

## Phase 2: Node.js & Express (Weeks 4-5)

**Topics:**
- [ ] Node.js runtime, CommonJS vs ESM
- [ ] Express: routing, middleware, request/response cycle
- [ ] Middleware patterns (auth, error handler, logger)
- [ ] Environment variables (.env)
- [ ] CORS, Helmet, compression
- [ ] Rate limiting

**Mini Project:** Simple CRUD API (books, users) with Express in TS

**CommerceFlow Reference:**
- `src/app.ts` — Express app setup
- `src/middleware/errorHandler.ts` — centralized error handling
- `src/config/index.ts` — Zod validated env config

---

## Phase 3: Databases (Weeks 6-8)

### SQL & PostgreSQL
- [ ] Tables, relationships (1:1, 1:N, N:M)
- [ ] SELECT, JOINs, GROUP BY, WHERE, indexes
- [ ] Transactions (ACID)
- [ ] Composite indexes (`@@index([col1, col2])`)
- [ ] Soft deletes pattern

### Prisma ORM
- [ ] Schema design, models, enums
- [ ] Migrations
- [ ] CRUD operations
- [ ] Relations, includes, nested writes
- [ ] `$transaction` for atomicity

**Mini Project:** Blog platform (users, posts, comments) with Prisma

**CommerceFlow Reference:**
- `prisma/schema.prisma` — complete 15-model schema
- `src/repositories/productRepository.ts` — findMany with filters, pagination
- `src/services/orderService.ts` — transaction usage (checkout)

---

## Phase 4: Authentication & Security (Weeks 9-10)

**Topics:**
- [ ] JWT (access + refresh tokens)
- [ ] Refresh token rotation (revoke on reuse)
- [ ] bcrypt hashing (salt rounds)
- [ ] Email verification flow
- [ ] Forgot/reset password flow
- [ ] Helmet, CORS, SQL injection (Prisma protects)
- [ ] Rate limiting (express-rate-limit)

**Mini Project:** Auth system with register/login/logout/refresh/forgot-password

**CommerceFlow Reference:**
- `src/services/authService.ts` — complete auth flow
- `src/middleware/auth.ts` — JWT verify + role-based auth
- `src/middleware/requestId.ts` — unique request IDs for tracking

---

## Phase 5: Caching with Redis (Week 11)

**Topics:**
- [ ] Redis basic commands (GET, SET, EXPIRE, KEYS, DEL)
- [ ] Caching strategy (read-through, write-through)
- [ ] Cache invalidation (by pattern)
- [ ] Redis as session store
- [ ] ioredis client

**Mini Project:** Cache layer for product API from Phase 2

**CommerceFlow Reference:**
- `src/config/redis.ts` — Redis connection with retry logic
- `src/middleware/cache.ts` — middleware that caches GET requests
- `src/services/orderService.ts` line 126 — cache invalidation

---

## Phase 6: Background Jobs (Week 12)

**Topics:**
- [ ] BullMQ: Queue, Worker, QueueEvents
- [ ] Job producers vs consumers
- [ ] Retry with exponential backoff
- [ ] Dead Letter Queue (DLQ) — jobs stored 30 days on fail
- [ ] Concurrency & rate limiting
- [ ] Multiple queues per concern

**Mini Project:** Email notification system with queue

**CommerceFlow Reference:**
- `src/workers/queue.ts` — queue setup + `addJob()` function
- `src/workers/processors.ts` — job processors (email, invoice, notification)
- `src/workers/index.ts` — worker bootstrap

---

## Phase 7: Payments & Webhooks (Week 13)

**Topics:**
- [ ] Stripe: PaymentIntents, client_secret, confirm
- [ ] Webhook signature verification
- [ ] Idempotency (prevent duplicate charges)
- [ ] Payment status workflow (pending → completed/failed)

**CommerceFlow Reference:**
- `src/services/paymentService.ts` — full Stripe flow
- `src/middleware/idempotency.ts` — idempotency-key middleware

---

## Phase 8: Observability (Week 14)

**Topics:**
- [ ] Pino structured logging (JSON logs)
- [ ] Log levels, serializers, redaction
- [ ] Prometheus metrics: Histogram, Counter, Gauge
- [ ] Health checks (live + ready endpoints)
- [ ] Swagger API docs

**CommerceFlow Reference:**
- `src/config/logger.ts` — Pino setup with redaction
- `src/config/metrics.ts` — Prometheus metrics middleware
- `src/routes/healthRoutes.ts` — health endpoints

---

## Phase 9: Docker & CI/CD (Week 15)

**Topics:**
- [ ] Dockerfile: multi-stage builds
- [ ] docker-compose: postgres, redis, api, worker, nginx
- [ ] .dockerignore
- [ ] Non-root user in container
- [ ] HEALTHCHECK
- [ ] GitHub Actions: lint → test → build → deploy

**CommerceFlow Reference:**
- `Dockerfile` — multi-stage (builder + production)
- `docker-compose.yml` — complete stack
- `.github/workflows/ci.yml` — full CI pipeline

---

## Phase 10: System Design (Weeks 16-20)

**Topics:**
- [ ] Vertical vs horizontal scaling
- [ ] Load balancers, CDN
- [ ] Database indexing strategy
- [ ] Cursor vs offset pagination
- [ ] Rate limiting strategies
- [ ] Caching strategies (Redis)
- [ ] Message queues (BullMQ)
- [ ] Microservices vs monolith
- [ ] C4 diagrams

**Read:** "Designing Data-Intensive Applications" (slowly, chapter by chapter)

---

## Your CommerceFlow = Production-Ready Project

After learning each phase, go back to the corresponding CommerceFlow file. You'll realize: **ye project FAANG-level ka hai.** Sirf resume mein sahi words use karne hain.

### Everyday Practice (LeetCode)
DSA bhi equally important hai. Daily 1 problem:
- Arrays/Strings (Meta-focused)
- Trees/Graphs (Google-focused)
- DP (Amazon-focused)

Platform: LeetCode, start with Easy → Medium

---

## Resources Summary

| Area | Free Resource |
|------|--------------|
| TypeScript | official handbook |
| Node.js | Node.js docs |
| Express | expressjs.com |
| PostgreSQL | postgresqltutorial.com |
| Prisma | prisma.io/docs |
| Redis | redis.io/docs |
| BullMQ | docs.bullmq.io |
| Stripe | stripe.com/docs |
| Docker | docs.docker.com |
| GitHub Actions | docs.github.com |
| Prometheus | prometheus.io |
| System Design | DDIA book, youtube (Hussein Nasser) |
| DSA | LeetCode, NeetCode.io |

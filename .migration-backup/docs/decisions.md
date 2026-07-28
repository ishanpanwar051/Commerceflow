# Architecture Decision Records

## ADR-001: Express over NestJS/Fastify

**Status**: Accepted

**Context**: Need a lightweight, well-understood HTTP framework with extensive middleware ecosystem.

**Decision**: Use Express.js with TypeScript for the API server.

**Rationale**: Largest middleware ecosystem, team familiarity, sufficient performance for e-commerce workloads. Clean Architecture patterns provide structure without framework overhead.

---

## ADR-002: BullMQ for Job Processing

**Status**: Accepted

**Context**: Need reliable async job processing with retries, priorities, and monitoring.

**Decision**: Use BullMQ with Redis as the message broker.

**Rationale**: Native TypeScript support, built-in retry/backoff, priority queues, delayed jobs, Bull Board dashboard, and proven production track record.

---

## ADR-003: Cursor-Based Pagination

**Status**: Accepted

**Context**: Offset pagination degrades at scale with large datasets.

**Decision**: Implement cursor-based pagination using `(createdAt, id)` composite cursor.

**Rationale**: Consistent performance regardless of page depth. No duplicate/missing items during concurrent writes.

---

## ADR-004: Idempotency via Database Records

**Status**: Accepted

**Context**: Payment and order endpoints must be safe to retry without duplicates.

**Decision**: Store idempotency records in PostgreSQL with TTL-based expiration.

**Rationale**: Transaction-safe, durable, auditable. Redis-based idempotency lacks durability guarantees for financial operations.

---

## ADR-004: Separate Worker Process

**Status**: Accepted

**Context**: Background jobs should not compete with API request handling for CPU/memory.

**Decision**: Run workers as a separate process/container from the API server.

**Rationale**: Independent scaling, failure isolation, zero impact on API latency during heavy job processing.

---

## ADR-005: Prisma ORM

**Status**: Accepted

**Context**: Need type-safe database access with migration support.

**Decision**: Use Prisma with PostgreSQL.

**Rationale**: Type-safe queries, declarative schema, migration tooling, connection pooling, and excellent TypeScript integration.

---

## ADR-006: API Versioning via URL Path

**Status**: Accepted

**Context**: Need backward-compatible API evolution.

**Decision**: Version APIs via URL prefix (`/api/v1/`).

**Rationale**: Simple, explicit, widely understood. Easy to route at load balancer level.

---

## ADR-007: Structured Logging with Pino

**Status**: Accepted

**Context**: Production systems need searchable, structured logs with correlation IDs.

**Decision**: Use Pino for JSON structured logging with request ID propagation.

**Rationale**: Fastest Node.js logger, JSON output for log aggregation, low overhead.

---

## ADR-008: Zod for Configuration Validation

**Status**: Accepted

**Context**: Invalid configuration causes runtime failures in production.

**Decision**: Validate all environment variables at startup using Zod schemas.

**Rationale**: Fail fast on misconfiguration, typed config object, clear error messages.

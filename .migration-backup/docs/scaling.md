# Scaling Guide

## Horizontal Scaling

### API Server

- Stateless design enables multiple API instances behind a load balancer
- Session data stored in JWT (no server-side sessions)
- Nginx upstream with `least_conn` load balancing

```yaml
# Scale API containers
docker compose up --scale api=3 --scale worker=2
```

### Worker Processes

- Workers scale independently from API
- BullMQ handles job distribution across worker instances
- Configure concurrency per queue type

| Queue | Concurrency | Priority |
|-------|-------------|----------|
| email | 10 | HIGH |
| payment | 5 | CRITICAL |
| invoice | 3 | HIGH |
| inventory | 3 | NORMAL |
| scheduled | 2 | LOW |
| image | 2 | BACKGROUND |

## Database Scaling

### Read Replicas

Route read-heavy queries to replicas:

```
DATABASE_URL=postgresql://...primary...
DATABASE_READ_URL=postgresql://...replica...
```

### Index Optimization

All frequently queried columns indexed. Composite indexes for common query patterns. See [database-design.md](./database-design.md).

### Connection Pooling

| Environment | Pool Size |
|-------------|-----------|
| Development | 10 |
| Staging | 20 |
| Production | 50 |

## Caching Strategy

### Redis Cache Layers

| Cache Key Pattern | TTL | Invalidation |
|-------------------|-----|--------------|
| `product:{id}` | 300s | On product update |
| `products:{filters}` | 120s | On any product change |
| `category:{id}` | 300s | On category update |

### Cache Invalidation

- Write-through on product create/update
- Pattern-based invalidation for list caches
- ETag support for client-side caching

## Redis Scaling

- Redis Cluster for high availability
- Separate Redis instances for cache vs queues (recommended at scale)
- BullMQ supports Redis Cluster mode

## Performance Targets

| Metric | Target |
|--------|--------|
| API p95 latency | < 200ms |
| Database query p95 | < 50ms |
| Cache hit rate | > 80% |
| Queue processing lag | < 30s |
| Error rate | < 0.1% |

## Monitoring for Scale

- Prometheus metrics at `/metrics`
- Grafana dashboards in `monitoring/grafana/`
- OpenTelemetry distributed tracing
- Slow query logging (> 100ms in development)

## Auto-Scaling Triggers (Kubernetes)

```yaml
# Scale API when CPU > 70% or request latency > 500ms
# Scale workers when queue depth > 100 jobs
```

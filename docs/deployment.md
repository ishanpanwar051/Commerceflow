# Deployment Guide

## Local Development

```bash
# Start dependencies
docker compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Start API
npm run dev

# Start worker (separate terminal)
npm run dev:worker
```

## Docker (Full Stack)

```bash
docker compose up --build
```

Services: `postgres:5432`, `redis:6379`, `api:4000`, `worker`, `nginx:80`

## Production (AWS ECS)

1. Build and push Docker image
2. Set environment variables in Parameter Store
3. Deploy with ECS service (2+ replicas)
4. Attach RDS PostgreSQL + ElastiCache Redis
5. Configure Application Load Balancer
6. Set up CloudWatch logging

## Environment Variables

See `env/.env.production` for full list. Required:
- DATABASE_URL
- REDIS_HOST, REDIS_PORT
- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# Deployment Guide

Complete guide for deploying CommerceFlow to production.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Platform-Specific Guides](#platform-specific-guides)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [SSL/HTTPS](#sslhttps)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd CommerceFlow

# Create .env file
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
curl http://localhost:4000/api/v1/health
```

### Services

The docker-compose setup includes:

- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 for caching and job queues
- **backend**: Express API server
- **worker**: Background job processor
- **frontend**: Next.js application

### Environment Variables

Create `.env` file with production settings:

```env
# Database
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://commerceflow:your_secure_password@postgres:5432/commerceflow?schema=public

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Secrets (generate with: node scripts/generate-secrets.js)
JWT_ACCESS_SECRET=your_64_char_random_secret_here
JWT_REFRESH_SECRET=another_64_char_random_secret_here

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email (configure your provider)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Build specific service
docker-compose build backend

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Access database
docker-compose exec postgres psql -U commerceflow -d commerceflow
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2 for process management
npm install -g pm2
```

### 2. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd CommerceFlow

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with production values

# Build backend
npm run build

# Build frontend
cd frontend && npm run build && cd ..

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 3. Start with PM2

```bash
# Start backend
pm2 start dist/server.js --name commerceflow-api

# Start worker
pm2 start dist/workers/index.js --name commerceflow-worker

# Start frontend
cd frontend && pm2 start npm --name commerceflow-frontend -- start && cd ..

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 4. Configure Nginx

```nginx
# /etc/nginx/sites-available/commerceflow

# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/commerceflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Platform-Specific Guides

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Add Redis
railway add

# Deploy
railway up
```

Set environment variables in Railway dashboard.

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Configure security groups (ports 80, 443, 22)
3. Follow manual deployment steps
4. Set up CloudWatch for monitoring

### DigitalOcean

1. Create Droplet (Ubuntu 22.04)
2. Add managed PostgreSQL database
3. Add managed Redis cluster
4. Follow manual deployment steps
5. Configure firewall

### Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set JWT_ACCESS_SECRET=your_secret

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

## Environment Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
DATABASE_POOL_URL=postgresql://user:pass@pooler:6543/db?pgbouncer=true

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS_ENABLED=true

# JWT (64+ character random strings)
JWT_ACCESS_SECRET=generate_with_scripts/generate-secrets.js
JWT_REFRESH_SECRET=generate_with_scripts/generate-secrets.js
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (live keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

## Database Setup

### PostgreSQL

1. **Create Database**
```sql
CREATE DATABASE commerceflow;
CREATE USER commerceflow WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE commerceflow TO commerceflow;
```

2. **Run Migrations**
```bash
npx prisma migrate deploy
```

3. **Connection Pooling (Recommended)**

Use PgBouncer for connection pooling:
```env
DATABASE_POOL_URL=postgresql://user:pass@pooler:6543/db?pgbouncer=true
```

### Backup

```bash
# Backup database
pg_dump -U commerceflow -d commerceflow > backup.sql

# Restore database
psql -U commerceflow -d commerceflow < backup.sql

# Automated daily backups
0 2 * * * pg_dump -U commerceflow -d commerceflow > /backups/db-$(date +\%Y\%m\%d).sql
```

## SSL/HTTPS

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl status certbot.timer
```

### Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (Strict)" SSL mode
4. Enable "Always Use HTTPS"
5. Enable "Auto Minify" for performance

## Monitoring

### Health Checks

```bash
# Liveness (is app running?)
curl https://api.yourdomain.com/api/v1/health/live

# Readiness (can serve traffic?)
curl https://api.yourdomain.com/api/v1/health/ready

# Full health (all dependencies)
curl https://api.yourdomain.com/api/v1/health
```

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs

# View metrics
pm2 monit

# Web dashboard
pm2 plus
```

### External Monitoring

- **UptimeRobot**: Free uptime monitoring
- **Datadog**: Application monitoring
- **Sentry**: Error tracking
- **LogDNA**: Log management

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%%d-%H%M%S)

# Database backup
docker-compose exec -T postgres pg_dump -U commerceflow commerceflow > backup-$DATE.sql

# Upload to S3 (optional)
aws s3 cp backup-$DATE.sql s3://your-bucket/backups/

# Keep last 30 days
find /backups -name "backup-*.sql" -mtime +30 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

### Disaster Recovery

```bash
# Stop application
docker-compose down

# Restore database
docker-compose up -d postgres
docker-compose exec -T postgres psql -U commerceflow -d commerceflow < backup.sql

# Start application
docker-compose up -d
```

## Performance Optimization

### Database

```sql
-- Add indexes
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_orders_user ON orders(userId);

-- Analyze tables
ANALYZE products;
ANALYZE orders;
```

### Caching

- Enable Redis for caching
- Set appropriate TTL values
- Cache frequently accessed data

### CDN

- Use Cloudflare or AWS CloudFront
- Cache static assets
- Enable Brotli compression

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong JWT secrets (64+ chars)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable PostgreSQL SSL
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement backup strategy

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose logs postgres
```

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U commerceflow -d commerceflow
```

### High memory usage
```bash
# Check memory
docker stats

# Restart services
docker-compose restart backend
```

### Application crashes
```bash
# View logs
pm2 logs commerceflow-api --lines 100

# Restart with PM2
pm2 restart commerceflow-api
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

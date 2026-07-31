# CommerceFlow - Production-Ready E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js, Express, Prisma, and PostgreSQL/SQLite.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control
- **Product Management**: Full CRUD with categories, images, inventory tracking
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order lifecycle from checkout to delivery
- **Payment Processing**: Stripe integration with webhook support
- **Email Notifications**: Professional email templates for all events
- **Image Upload**: Cloudinary integration for product and avatar images
- **Search & Filters**: Advanced product search with multiple filters
- **Admin Dashboard**: Complete admin panel for management
- **Security**: Rate limiting, input sanitization, XSS protection, CSRF protection
- **Monitoring**: Health checks, metrics, structured logging
- **Production-Ready**: Docker support, PostgreSQL, Redis caching, job queues

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- PostgreSQL (production) or SQLite (development)
- Redis (optional, for caching and queues)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd CommerceFlow

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

```bash
# Generate secure JWT secrets
node scripts/generate-secrets.js

# Copy example env files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Edit .env files with your values
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL="file:./prisma/dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://user:pass@localhost:5432/commerceflow"  # PostgreSQL for prod

# JWT (use generated secrets)
JWT_ACCESS_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Automatic setup (detects SQLite or PostgreSQL)
npm run db:setup

# Or manual setup
npm run db:generate
npm run db:push      # SQLite
# npm run db:migrate # PostgreSQL

# Seed with sample data
npm run db:seed
```

### 4. Run Development Servers

```bash
# Run all services (backend, frontend, worker)
npm run dev:all

# Or run individually
npm run dev          # Backend on :4000
npm run dev:worker   # Background jobs
cd frontend && npm run dev  # Frontend on :3000
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **API Docs**: http://localhost:4000/api/v1/docs
- **Health Check**: http://localhost:4000/api/v1/health

## 🧪 Test Accounts

After running `npm run db:seed`, use these credentials:

| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Admin    | admin@commerceflow.dev   | Admin@123 |
| Customer | customer@example.com     | Admin@123 |
| Seller   | seller@example.com       | Admin@123 |

## 📚 Documentation

- [Database Migration Guide](docs/database-migration.md)
- [Email Configuration](docs/email-configuration.md)
- [Frontend Authentication](docs/frontend-authentication.md)
- [Deployment Guide](docs/deployment.md)
- [API Documentation](http://localhost:4000/api/v1/docs)

## 🔧 Configuration

### Database

**Development (SQLite):**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**Production (PostgreSQL):**
```env
DATABASE_URL="postgresql://user:password@host:5432/commerceflow?schema=public"
DATABASE_POOL_URL="postgresql://user:password@pooler:6543/commerceflow?pgbouncer=true"
```

See [Database Migration Guide](docs/database-migration.md) for details.

### Email Service

**Development (Mailhog):**
```bash
# Install and run Mailhog
brew install mailhog  # macOS
mailhog

# View emails at http://localhost:8025
```

```env
SMTP_HOST=localhost
SMTP_PORT=1025
```

**Production:**
Configure your email provider (SendGrid, AWS SES, etc.):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

See [Email Configuration](docs/email-configuration.md) for details.

### Stripe Payments

1. Get keys from https://dashboard.stripe.com/test/apikeys
2. Configure backend:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
3. Configure frontend:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Image Uploads (Cloudinary)

1. Create account at https://cloudinary.com
2. Configure:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [Deployment Guide](docs/deployment.md) for production deployment.

## 📦 Project Structure

```
CommerceFlow/
├── src/                    # Backend source
│   ├── config/            # Configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   └── workers/          # Background jobs
├── frontend/              # Next.js frontend
│   └── src/
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── services/     # API clients
│       ├── store/        # Redux store
│       └── lib/          # Utilities
├── prisma/               # Database schema & migrations
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Checks

- **Liveness**: `GET /api/v1/health/live` - Is app running?
- **Readiness**: `GET /api/v1/health/ready` - Can serve traffic?
- **Full Health**: `GET /api/v1/health` - All dependencies
- **Metrics**: `GET /api/v1/health/metrics` - App metrics

### Logs

Structured JSON logs with Pino:

```bash
# View logs in development
npm run dev

# Production log levels
LOG_LEVEL=info  # fatal, error, warn, info, debug, trace
```

## 🔒 Security

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on all endpoints
- ✅ Input sanitization and validation
- ✅ XSS and SQL injection protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Brute force protection
- ✅ HTTPS in production (required)

## 🚢 Production Checklist

Before deploying to production:

- [ ] Configure PostgreSQL database
- [ ] Set up Redis for caching
- [ ] Configure production email service
- [ ] Set up Stripe with live keys
- [ ] Configure Cloudinary for images
- [ ] Set strong JWT secrets (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (health checks)
- [ ] Configure backups
- [ ] Review CORS origins
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 Scripts Reference

```bash
# Development
npm run dev              # Start backend
npm run dev:worker       # Start background worker
npm run dev:all          # Start all services

# Database
npm run db:setup         # Auto-detect and setup DB
npm run db:setup:sqlite  # Setup SQLite
npm run db:setup:postgres # Setup PostgreSQL
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema (SQLite)
npm run db:migrate       # Run migrations (PostgreSQL)
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Build & Production
npm run build            # Build backend
npm start                # Start production server
npm run start:worker     # Start production worker

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage

# Code Quality
npm run lint             # Lint code
npm run typecheck        # Type check
```

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Regenerate Prisma client
npm run db:generate

# For PostgreSQL, verify it's running
psql -h localhost -U postgres
```

### Redis Connection Error
Redis is optional. The app will run without it (caching/queues disabled).

To use Redis:
```bash
# macOS
brew install redis
redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### Email Not Sending
For development, use Mailhog or leave SMTP settings empty.
For production, configure your email provider in .env.

### Port Already in Use
```bash
# Kill process on port 4000
npx kill-port 4000

# Or change port in .env
PORT=5000
```

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Express](https://expressjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Cloudinary](https://cloudinary.com/) - Image management
- [Redis](https://redis.io/) - Caching & queues
- [PostgreSQL](https://www.postgresql.org/) - Database

---

**Need Help?** Check the [documentation](./docs/) or open an issue.

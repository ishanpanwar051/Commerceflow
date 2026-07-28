# CommerceFlow Setup Guide

Quick setup guide to get CommerceFlow running in minutes.

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 2. Generate Secrets

```bash
node scripts/generate-secrets.js
```

Copy the output secrets to your `.env` file.

### 3. Setup Environment

```bash
# Copy example files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Edit .env with the generated secrets
# Minimum required:
# - JWT_ACCESS_SECRET (from step 2)
# - JWT_REFRESH_SECRET (from step 2)
# - DATABASE_URL (default: file:./prisma/dev.db)
```

### 4. Setup Database

```bash
npm run db:setup
# This automatically detects SQLite/PostgreSQL and sets up everything
```

### 5. Start Development

```bash
# Start all services (backend + frontend + worker)
npm run dev:all

# Or start individually:
npm run dev          # Backend: http://localhost:4000
cd frontend && npm run dev  # Frontend: http://localhost:3000
```

## ✅ Test It Works

1. **Backend**: http://localhost:4000/api/v1/health
2. **Frontend**: http://localhost:3000
3. **API Docs**: http://localhost:4000/api/v1/docs

## 🔑 Test Login

Use these seeded accounts:

- **Admin**: admin@commerceflow.dev / Admin@123
- **Customer**: customer@example.com / Admin@123

## 📦 What's Included

- ✅ Full authentication system (JWT + refresh tokens)
- ✅ Product catalog with categories
- ✅ Shopping cart & wishlist
- ✅ Order management
- ✅ Stripe payment integration (ready to configure)
- ✅ Email notifications with templates
- ✅ Image uploads with Cloudinary (ready to configure)
- ✅ Admin dashboard
- ✅ Security & rate limiting
- ✅ Health checks & monitoring
- ✅ Docker support
- ✅ Production-ready

## 🔧 Optional Services

### Stripe Payments

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test keys from **Developers** → **API Keys**
3. Add to **backend** `.env`:
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```
4. Add to **frontend** `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```
5. **Setup Webhook** (for production):
   - Go to **Developers** → **Webhooks** → **Add endpoint**
   - URL: `https://yourdomain.com/api/v1/payments/webhook`
   - Events: Select `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**Note**: Payments are optional. Users can still browse and add to cart without Stripe configured.

### Cloudinary Images

1. Sign up at [Cloudinary Console](https://cloudinary.com/console)
2. Go to **Dashboard** → copy your credentials
3. Add to **backend** `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret
```
4. **Test upload**: Go to `/profile` → upload avatar (requires login)

**Note**: Image uploads are optional. App works with default avatars if not configured.

### Google OAuth Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (set to External for testing)
6. Create OAuth Client:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
7. Copy the **Client ID**
8. Add to **backend** `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```
9. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
10. Go to Project Settings → General → Your apps → Web app
11. Copy Firebase config and add to **frontend** `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```
12. In Firebase Console, enable **Google Sign-In** in Authentication → Sign-in method

**Note**: Google sign-in is optional. Users can still register with email/password if not configured.

### Email Service

**Development (Recommended)**: Use Mailhog for testing
```bash
# macOS
brew install mailhog
mailhog
# View emails at http://localhost:8025

# Docker alternative
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

**Development Alternative**: Use MailCatcher
```bash
gem install mailcatcher
mailcatcher
# View emails at http://localhost:1080
```

**Production Options**: Configure your provider in `.env`:

**SendGrid** (recommended):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Gmail**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password  # Not your regular password!
EMAIL_FROM=noreply@yourdomain.com
```

**AWS SES**:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_smtp_user
SMTP_PASS=your_aws_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

**Note**: Email is optional but recommended for user registration verification and order notifications.

### Redis (Optional - for caching & queues)

Redis improves performance with caching and enables background job processing.

**Development**:
```bash
# macOS
brew install redis
redis-server

# Ubuntu/Debian
sudo apt install redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**Production**: Add connection details to `.env`:
```env
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TLS_ENABLED=true  # if using TLS
```

**Cloud Options**:
- **AWS ElastiCache Redis**
- **Railway Redis** (built-in)  
- **Redis Cloud** (free tier available)
- **Upstash Redis** (serverless)

**Note**: App works without Redis - it just disables caching and background jobs.

### Database Migration (SQLite ↔ PostgreSQL)

**Development**: Uses SQLite (no setup required)
```env
DATABASE_URL="file:./dev.db"
```

**Production**: Switch to PostgreSQL
```env
# Replace in .env:
DATABASE_URL="postgresql://user:password@host:5432/commerceflow"
```

Then migrate:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

**Cloud PostgreSQL Options**:
- **Supabase** (free tier)
- **Railway PostgreSQL** 
- **PlanetScale** (MySQL compatible)
- **AWS RDS** 
- **DigitalOcean Managed Database**

See [database-migration.md](docs/database-migration.md) for detailed guide.

## 🐳 Docker Setup

```bash
docker-compose up -d
```

Includes: PostgreSQL, Redis, Backend, Worker, Frontend

## 📚 Documentation

- [README.md](README.md) - Project overview
- [Database Migration](docs/database-migration.md) - SQLite ↔ PostgreSQL
- [Email Configuration](docs/email-configuration.md) - Email setup
- [Frontend Authentication](docs/frontend-authentication.md) - Auth flow
- [Deployment](docs/deployment.md) - Production deployment

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
npx kill-port 4000  # Backend
npx kill-port 3000  # Frontend
```

**Database Connection Error**
```bash
# Regenerate Prisma client
npm run db:generate

# Push schema to database  
npm run db:push

# If still issues, reset database
rm prisma/dev.db  # SQLite only
npm run db:setup
```

**"Cannot find module" Errors**
```bash
# Backend
rm -rf node_modules package-lock.json
npm install

# Frontend  
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Redis Connection Error** (optional service)
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis
redis-server

# Or disable Redis by commenting out in .env:
# REDIS_HOST=localhost
```

**Email Not Sending** (optional service)
```bash
# Check Mailhog is running (development)
curl http://localhost:8025

# Start Mailhog
mailhog

# View sent emails at http://localhost:8025
```

**Stripe Payments Not Working** (optional service)
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in frontend/.env.local
- Check `STRIPE_SECRET_KEY` is set in backend/.env  
- Verify keys are for same account (test/live)
- Check browser console for Stripe errors

**Google Sign-in Not Working** (optional service)
- Check Firebase config is complete in frontend/.env.local
- Verify `GOOGLE_CLIENT_ID` is set in backend/.env
- Ensure OAuth consent screen is configured
- Check browser console for Firebase errors

**Category Pages Show No Products**
- Ensure database is seeded: `npm run db:seed`
- Check if products exist: `npm run db:studio`
- Verify API responds: `curl http://localhost:4000/api/v1/products`

**Registration/Login Failing**
- Check JWT secrets are set in .env (use `node scripts/generate-secrets.js`)
- Verify database is connected and seeded
- Check API logs for errors: `npm run dev` (backend)

### Getting Help

1. **API Health Check**: http://localhost:4000/api/v1/health
2. **Database Browser**: `npm run db:studio`  
3. **View Logs**: `npm run dev` (backend) shows detailed logs
4. **Check Documentation**: All features documented in `/docs` folder
5. **Environment Check**: Verify all required .env variables are set

## 🎯 Next Steps

1. ✅ **Test Basic Flow**:
   - Register account at http://localhost:3000/register
   - Browse products and add to cart
   - Test checkout flow (works without payment setup)

2. ✅ **Configure Optional Services** (as needed):
   - **Stripe** for payments (get test keys)
   - **Cloudinary** for image uploads  
   - **Firebase** for Google sign-in
   - **Email service** for notifications
   - **Redis** for better performance

3. ✅ **Explore Admin Features**:
   - Login with admin@commerceflow.dev / Admin@123
   - Visit http://localhost:3000/admin
   - Manage products, users, orders

4. ✅ **API Documentation**:
   - Explore API: http://localhost:4000/api/v1/docs
   - Test endpoints with built-in Swagger UI

5. ✅ **Production Deployment**:
   - Read [deployment.md](docs/deployment.md)
   - Configure PostgreSQL for production
   - Set up proper domain and SSL

## 🚀 Quick Service Status Check

| Service | Required | Status Check | Setup Guide |
|---------|----------|-------------|-------------|
| **Database** | ✅ Yes | `npm run db:studio` | Auto-configured (SQLite) |
| **Authentication** | ✅ Yes | Login at `/login` | Auto-configured |
| **Products & Cart** | ✅ Yes | Browse `/products` | Auto-configured |
| **Stripe Payments** | ❌ No | Test checkout | [Setup Guide](#stripe-payments) |
| **Google Sign-in** | ❌ No | Click "Google" on login | [Setup Guide](#google-oauth-sign-in) |
| **Email Service** | ❌ No | Register account | [Setup Guide](#email-service) |
| **Image Uploads** | ❌ No | Upload avatar in profile | [Setup Guide](#cloudinary-images) |
| **Redis Cache** | ❌ No | Check logs for Redis errors | [Setup Guide](#redis-optional---for-caching--queues) |

## 💡 Tips

- Use `npm run db:studio` to browse database
- Check logs with `npm run dev` in verbose mode
- Health check: `curl http://localhost:4000/api/v1/health`
- View all scripts: `npm run` (no args)

---

**Need help?** Check the [full documentation](README.md) or open an issue.

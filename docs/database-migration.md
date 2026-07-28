# Database Migration Guide

This guide explains how to work with both SQLite (development) and PostgreSQL (production) databases in CommerceFlow.

## Table of Contents
- [Quick Start](#quick-start)
- [SQLite Setup (Development)](#sqlite-setup-development)
- [PostgreSQL Setup (Production)](#postgresql-setup-production)
- [Switching Between Databases](#switching-between-databases)
- [Migrations](#migrations)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Automatic Setup
The easiest way to set up your database is using the setup script:

```bash
# Auto-detect database type from DATABASE_URL
npm run db:setup

# Or specify explicitly
npm run db:setup:sqlite    # For development
npm run db:setup:postgres  # For production
```

### Manual Setup

1. **Configure your `.env` file**:
   ```bash
   # For SQLite (Development)
   DATABASE_URL="file:./prisma/dev.db"
   
   # For PostgreSQL (Production)
   DATABASE_URL="postgresql://user:password@localhost:5432/commerceflow?schema=public"
   ```

2. **Initialize the database**:
   ```bash
   npm run db:generate  # Generate Prisma Client
   npm run db:push      # Push schema to database (SQLite)
   # OR
   npm run db:migrate   # Run migrations (PostgreSQL)
   ```

3. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## SQLite Setup (Development)

SQLite is perfect for local development with zero configuration.

### Configuration

1. Set in `.env`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. Run setup:
   ```bash
   npm run db:setup:sqlite
   ```

### Features
- ✅ Zero configuration
- ✅ File-based (portable)
- ✅ Fast for development
- ✅ Perfect for testing

### Limitations
- ⚠️ Not suitable for production
- ⚠️ Limited concurrency
- ⚠️ No advanced features (full-text search, etc.)

## PostgreSQL Setup (Production)

PostgreSQL is recommended for production with better performance and features.

### Local Development

Using Docker:
```bash
# Start PostgreSQL
docker run -d \
  --name commerceflow-postgres \
  -e POSTGRES_USER=commerceflow \
  -e POSTGRES_PASSWORD=commerceflow123 \
  -e POSTGRES_DB=commerceflow \
  -p 5432:5432 \
  postgres:16-alpine

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://commerceflow:commerceflow123@localhost:5432/commerceflow?schema=public"

# Run migrations
npm run db:setup:postgres
```

### Production Deployment

#### 1. Set up PostgreSQL database
Get credentials from your provider:
- AWS RDS
- Railway
- Supabase
- Heroku Postgres
- Neon
- etc.

#### 2. Configure environment variables
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&sslmode=require"

# Optional: Connection pooling (recommended for serverless)
DATABASE_POOL_URL="postgresql://user:password@host:5432/dbname?schema=public&pgbouncer=true&connection_limit=1"
```

#### 3. Run migrations
```bash
# Deploy migrations in production
npm run db:migrate:deploy

# Seed data (optional)
npm run db:seed
```

## Switching Between Databases

### From SQLite to PostgreSQL

1. **Backup SQLite data** (optional):
   ```bash
   npm run db:studio  # Browse and export data if needed
   ```

2. **Update DATABASE_URL** in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Switch schema**:
   ```bash
   npm run db:setup:postgres
   ```

4. **Migrate data** (if needed):
   - Export from SQLite using Prisma Studio
   - Use custom migration script
   - Or re-seed with `npm run db:seed`

### From PostgreSQL to SQLite

1. **Update DATABASE_URL** in `.env`:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Switch schema**:
   ```bash
   npm run db:setup:sqlite
   ```

3. **Seed database**:
   ```bash
   npm run db:seed
   ```

## Migrations

### Understanding Prisma Migrations

**SQLite (db push)**:
- Uses `prisma db push` - no migration files
- Direct schema sync
- Good for development

**PostgreSQL (migrations)**:
- Uses `prisma migrate` - creates migration files
- Version controlled
- Required for production

### Common Migration Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create a new migration (PostgreSQL)
npm run db:migrate:create

# Apply migrations (development)
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Reset database (⚠️ deletes all data)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

### Creating a Migration

1. **Modify `prisma/schema.prisma`**
2. **Create migration**:
   ```bash
   npm run db:migrate:create
   # Give it a name: "add_user_preferences"
   ```
3. **Review migration file** in `prisma/migrations/`
4. **Apply migration**:
   ```bash
   npm run db:migrate
   ```

## Schema Files

CommerceFlow maintains separate schema files for each database:

- `prisma/schema.prisma` - Active schema (auto-switched by setup script)
- `prisma/schema.sqlite.prisma` - SQLite-specific schema
- `prisma/schema.postgres.prisma` - PostgreSQL-specific schema

## Connection Pooling

For production PostgreSQL, use connection pooling:

```env
# Direct connection
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Pooled connection (e.g., via PgBouncer)
DATABASE_POOL_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

The application will prefer `DATABASE_POOL_URL` if provided.

## Troubleshooting

### "Table does not exist" error
```bash
# Regenerate client and push schema
npm run db:generate
npm run db:push  # SQLite
# OR
npm run db:migrate  # PostgreSQL
```

### "Prisma Client did not initialize yet"
```bash
npm run db:generate
```

### Migration conflicts
```bash
# Reset and start fresh (⚠️ destroys data)
npm run db:reset

# Or resolve manually in prisma/migrations/
```

### PostgreSQL connection errors
- Check DATABASE_URL format
- Verify credentials
- Ensure PostgreSQL is running
- Check firewall/security groups
- For cloud databases, ensure IP is whitelisted

### SQLite locked database
- Close Prisma Studio
- Stop all Node processes
- Delete `.db-journal` file if exists

## Best Practices

### Development
1. Use SQLite for local development
2. Commit `prisma/schema.prisma` and migration files
3. Never commit `.db` files
4. Use `npm run db:seed` for test data

### Production
1. Use PostgreSQL
2. Always use migrations (never `db push`)
3. Set up connection pooling
4. Enable SSL/TLS
5. Regular backups
6. Monitor connection count

### CI/CD
1. Use PostgreSQL for staging/production
2. Run `db:migrate:deploy` not `db:migrate`
3. Test migrations on staging first
4. Have rollback plan

## Environment-Specific Setup

### `.env.development`
```env
DATABASE_URL="file:./prisma/dev.db"
```

### `.env.production`
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/commerceflow?sslmode=require"
DATABASE_POOL_URL="postgresql://user:pass@pooler-host:6543/commerceflow?pgbouncer=true"
```

## Additional Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

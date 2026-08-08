#!/bin/bash
# Production Database Restore Script
# This will restore the database with fixed seed data
# Run in Render Shell: bash scripts/restore-production.sh

echo "🚀 Restoring Production Database with Fixed Seed..."
echo "=================================================="

cd backend

# Step 1: Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Step 2: Push Schema
echo "🗄️  Pushing Database Schema..."
npx prisma db push --accept-data-loss

# Step 3: Seed Database
echo "🌱 Seeding Database with Fixed Logic..."
echo "   - Hash-based stable image selection"
echo "   - Mutually exclusive section flags"
echo "   - Complete category mappings"
echo ""

npx tsx prisma/seed.ts

# Step 4: Verify
echo ""
echo "✅ RESTORE COMPLETE!"
echo ""
echo "To verify, run:"
echo "  curl 'https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=3'"
echo ""
echo "Or check in browser:"
echo "  https://commerceflow-frontend-5c7v.onrender.com"

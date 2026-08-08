#!/bin/bash
# Emergency Seed Script for Render Shell
# Run this in Render Dashboard → commerceflow-api → Shell

echo "🚨 EMERGENCY SEED - Restoring Database"
echo "======================================"

cd backend

echo "📦 Step 1: Generate Prisma Client..."
npx prisma generate

echo "🗄️  Step 2: Push Database Schema..."
npx prisma db push --accept-data-loss

echo "🌱 Step 3: Seeding Database with Fixed Logic..."
npx tsx prisma/seed.ts

echo ""
echo "✅ SEED COMPLETE!"
echo "Please restart the service for changes to take effect."
echo ""
echo "To verify:"
echo "  curl 'https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=3'"

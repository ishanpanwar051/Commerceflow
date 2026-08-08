#!/bin/bash
# Safe Fix Script - Updates existing data without deletion
# Run in Render Shell: bash scripts/safe-fix.sh

echo "🔧 Fixing Existing Data (No Deletion)..."
echo "========================================"

# Check current state
echo "📊 Current state:"
psql $DATABASE_URL -c "
  SELECT 
    'Featured' as section, COUNT(*) as count FROM products WHERE \"isFeatured\" = true
  UNION ALL
  SELECT 'Bestsellers', COUNT(*) FROM products WHERE \"isBestSeller\" = true
  UNION ALL
  SELECT 'New Arrivals', COUNT(*) FROM products WHERE \"isNewArrival\" = true;
"

echo ""
echo "🔄 Applying fixes..."

# Run the fix SQL
psql $DATABASE_URL < backend/scripts/fix-existing-data.sql

echo ""
echo "✅ Fix Applied!"
echo ""
echo "📊 New state:"
psql $DATABASE_URL -c "
  SELECT 
    'Featured' as section, COUNT(*) as count FROM products WHERE \"isFeatured\" = true
  UNION ALL
  SELECT 'Bestsellers', COUNT(*) FROM products WHERE \"isBestSeller\" = true
  UNION ALL
  SELECT 'New Arrivals', COUNT(*) FROM products WHERE \"isNewArrival\" = true;
"

echo ""
echo "✅ DONE! Data fixed without deletion."
echo "Refresh website to see changes."

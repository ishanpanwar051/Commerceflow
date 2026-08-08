-- Fix Existing Data Script
-- This updates existing products without deleting anything
-- Safe to run on production database

-- Step 1: Fix overlapping section flags
-- Make them mutually exclusive

-- Reset all flags first
UPDATE products SET 
  "isFeatured" = false,
  "isBestSeller" = false, 
  "isNewArrival" = false,
  "isTopRated" = false;

-- Assign products to sections based on ID (stable distribution)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as rn
  FROM products
)
UPDATE products p
SET 
  "isFeatured" = CASE WHEN n.rn <= 20 THEN true ELSE false END,
  "isBestSeller" = CASE WHEN n.rn > 20 AND n.rn <= 40 AND p."soldCount" > 5000 THEN true ELSE false END,
  "isNewArrival" = CASE WHEN n.rn > 40 AND n.rn <= 60 THEN true ELSE false END,
  "isTopRated" = CASE WHEN n.rn > 60 AND n.rn <= 80 AND p."averageRating" > 4.5 THEN true ELSE false END
FROM numbered n
WHERE p.id = n.id;

-- Verify the fix
SELECT 
  'Featured' as section, COUNT(*) as count FROM products WHERE "isFeatured" = true
UNION ALL
SELECT 'Bestsellers', COUNT(*) FROM products WHERE "isBestSeller" = true
UNION ALL
SELECT 'New Arrivals', COUNT(*) FROM products WHERE "isNewArrival" = true
UNION ALL
SELECT 'Top Rated', COUNT(*) FROM products WHERE "isTopRated" = true;

-- Should show:
-- Featured: ~20
-- Bestsellers: 0-20 (depends on soldCount)
-- New Arrivals: ~20
-- Top Rated: 0-20 (depends on rating)

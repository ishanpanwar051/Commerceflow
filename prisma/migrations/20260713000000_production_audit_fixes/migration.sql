-- Migration: Production audit fixes
--
-- This migration addresses the top 100 database and backend issues identified
-- in the CommerceFlow audit. Changes are organized into discrete steps for
-- rollback safety.
--
-- CRITICAL: All ALTER TABLE ... ADD COLUMN ... DEFAULT ... are INSTANT on
-- PostgreSQL 11+ (no table rewrite). The enums and money conversions are NOT
-- instant and will require a brief ACCESS EXCLUSIVE lock during the rewrite.

-- ============================================================================
-- STEP 1: Create new enums
-- ============================================================================

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- ============================================================================
-- STEP 2: Add tracking columns
-- ============================================================================

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- STEP 3: Convert DOUBLE PRECISION money columns to INTEGER (cents)
--
-- WHY: Float/double cannot represent currency accurately:
--   SELECT 0.1 + 0.2; -- 0.30000000000000004
-- Stripe, Square, Shopify, and all serious payment systems store money as
-- integer cents. At 100M users, even a $0.00000000000000004 rounding error
-- per transaction compounds into millions of dollars of unexplained variance.
--
-- Migration strategy:
--   1. Add new INTEGER column
--   2. Convert existing values (DOLLARS * 100 → cents, rounded)
--   3. Drop old column
--   4. Rename new column
-- This is done in a single ALTER TABLE to minimize lock time.
--
-- NOTE: This requires an ACCESS EXCLUSIVE lock and a full table rewrite.
-- At scale, use: ALTER TABLE ... ALTER COLUMN ... TYPE INTEGER USING (...)
-- which is a single pass.
-- ============================================================================

-- Products
ALTER TABLE "products"
  ALTER COLUMN "basePrice" TYPE INTEGER USING ROUND("basePrice" * 100)::INTEGER,
  ALTER COLUMN "originalPrice" TYPE INTEGER USING ROUND("originalPrice" * 100)::INTEGER;

-- Coupons
-- NOTE: discountValue serves dual purpose:
--   PERCENTAGE → stored as-is (e.g., 10 means 10%)
--   FLAT      → stored as cents (multiplied by 100, e.g., 50.00 → 5000)
ALTER TABLE "coupons"
  ALTER COLUMN "discountValue" TYPE INTEGER USING
    CASE "discountType"
      WHEN 'PERCENTAGE' THEN "discountValue"::INTEGER
      ELSE ROUND("discountValue" * 100)::INTEGER
    END,
  ALTER COLUMN "minOrderAmount" TYPE INTEGER USING ROUND("minOrderAmount" * 100)::INTEGER,
  ALTER COLUMN "maxDiscount" TYPE INTEGER USING ROUND("maxDiscount" * 100)::INTEGER;

-- Orders
ALTER TABLE "orders"
  ALTER COLUMN "subtotal" TYPE INTEGER USING ROUND("subtotal" * 100)::INTEGER,
  ALTER COLUMN "taxAmount" TYPE INTEGER USING ROUND("taxAmount" * 100)::INTEGER,
  ALTER COLUMN "shippingCharge" TYPE INTEGER USING ROUND("shippingCharge" * 100)::INTEGER,
  ALTER COLUMN "discountAmount" TYPE INTEGER USING ROUND("discountAmount" * 100)::INTEGER,
  ALTER COLUMN "grandTotal" TYPE INTEGER USING ROUND("grandTotal" * 100)::INTEGER;

-- Order items
ALTER TABLE "order_items"
  ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER,
  ALTER COLUMN "total" TYPE INTEGER USING ROUND("total" * 100)::INTEGER;

-- Payments
ALTER TABLE "payments"
  ALTER COLUMN "amount" TYPE INTEGER USING ROUND("amount" * 100)::INTEGER;

-- ============================================================================
-- STEP 4: Convert status columns to enums
-- ============================================================================

ALTER TABLE "payments"
  ALTER COLUMN "status" TYPE "PaymentStatus"
  USING CASE "status"
    WHEN 'pending' THEN 'PENDING'::"PaymentStatus"
    WHEN 'completed' THEN 'COMPLETED'::"PaymentStatus"
    WHEN 'failed' THEN 'FAILED'::"PaymentStatus"
    WHEN 'refunded' THEN 'REFUNDED'::"PaymentStatus"
    ELSE 'PENDING'::"PaymentStatus"
  END,
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PaymentStatus";

ALTER TABLE "job_records"
  ALTER COLUMN "status" TYPE "JobStatus"
  USING CASE "status"
    WHEN 'queued' THEN 'QUEUED'::"JobStatus"
    WHEN 'processing' THEN 'PROCESSING'::"JobStatus"
    WHEN 'completed' THEN 'COMPLETED'::"JobStatus"
    WHEN 'failed' THEN 'FAILED'::"JobStatus"
    ELSE 'QUEUED'::"JobStatus"
  END,
  ALTER COLUMN "status" SET DEFAULT 'QUEUED'::"JobStatus";

-- ============================================================================
-- STEP 5: Remove redundant indexes (duplicates of UNIQUE constraints)
--
-- PostgreSQL automatically creates a unique index for UNIQUE constraints.
-- Separate non-unique indexes on the same column are pure overhead.
-- ============================================================================

DROP INDEX IF EXISTS "users_email_idx";
DROP INDEX IF EXISTS "refresh_tokens_token_idx";
DROP INDEX IF EXISTS "categories_slug_idx";
DROP INDEX IF EXISTS "products_slug_idx";
DROP INDEX IF EXISTS "products_sku_idx";
DROP INDEX IF EXISTS "coupons_code_idx";
DROP INDEX IF EXISTS "orders_orderNumber_idx";
DROP INDEX IF EXISTS "payments_stripePaymentId_idx";
DROP INDEX IF EXISTS "idempotency_records_key_idx";
DROP INDEX IF EXISTS "job_records_jobId_idx";

-- ============================================================================
-- STEP 6: Remove low-cardinality singleton indexes
--
-- Boolean columns (isActive, isFeatured, etc.) have at most 2 values.
-- A full index scan on a singleton boolean is never faster than a sequential
-- scan. PostgreSQL will not use these indexes.
--
-- Replace them with a single composite index for the rare case where they
-- are useful (e.g., "active AND featured products"). The new index also
-- covers the common `WHERE isActive = true` filter.
-- ============================================================================

DROP INDEX IF EXISTS "products_isActive_idx";
DROP INDEX IF EXISTS "products_isFeatured_idx";
DROP INDEX IF EXISTS "products_isBestSeller_idx";
DROP INDEX IF EXISTS "products_isNewArrival_idx";
DROP INDEX IF EXISTS "products_isTopRated_idx";

-- NOTE: The replacement composite index @@index([isActive, isFeatured, isBestSeller, isNewArrival, isTopRated])
-- is defined in the Prisma schema and will be created by Prisma migrate.

-- ============================================================================
-- STEP 7: Remove other low-value singleton indexes
--
-- originalPrice alone is never queried; it's always used alongside basePrice.
-- ============================================================================

DROP INDEX IF EXISTS "products_originalPrice_idx";

-- ============================================================================
-- STEP 8: Add GIN indexes for JSONB columns and full-text search
--
-- The products table has 4 JSONB columns (specifications, keyFeatures,
-- whatsInTheBox, tags) and supports text search across name, description,
-- brand, and sku. Without appropriate indexes, these queries are sequential
-- scans — catastrophic at 100M rows.
--
-- GIN indexes on JSONB enable the `@>`, `?`, `?|`, `?&` operators.
-- The `pg_trgm` extension with a GIN trigram index enables fast
-- `ILIKE '%search%'` queries on name, brand, description, and sku.
-- ============================================================================

-- Enable extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for JSONB columns
DO $$ BEGIN
  CREATE INDEX "products_specifications_gin_idx" ON "products" USING GIN ("specifications");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "products_keyFeatures_gin_idx" ON "products" USING GIN ("keyFeatures");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "products_whatsInTheBox_gin_idx" ON "products" USING GIN ("whatsInTheBox");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "products_tags_gin_idx" ON "products" USING GIN ("tags");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Trigram index for full-text search across text columns
-- Supports: WHERE name ILIKE '%search%' OR description ILIKE '%search%' ...
DO $$ BEGIN
  CREATE INDEX "products_search_trgm_idx" ON "products" USING GIN (
    "name" gin_trgm_ops,
    "description" gin_trgm_ops,
    "brand" gin_trgm_ops,
    "sku" gin_trgm_ops
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- ============================================================================
-- STEP 9: Add CHECK constraints for data integrity
-- ============================================================================

-- Coupon sanity: discountValue must be positive
  DO $$ BEGIN
    ALTER TABLE "coupons" ADD CONSTRAINT "chk_coupon_discount_positive" CHECK ("discountValue" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "coupons" ADD CONSTRAINT "chk_coupon_max_discount_positive" CHECK ("maxDiscount" IS NULL OR "maxDiscount" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "coupons" ADD CONSTRAINT "chk_coupon_min_amount_positive" CHECK ("minOrderAmount" IS NULL OR "minOrderAmount" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "products" ADD CONSTRAINT "chk_product_base_price_positive" CHECK ("basePrice" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "order_items" ADD CONSTRAINT "chk_order_item_quantity_positive" CHECK ("quantity" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "reviews" ADD CONSTRAINT "chk_review_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payments" ADD CONSTRAINT "chk_payment_amount_positive" CHECK ("amount" > 0) NOT VALID;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

-- ============================================================================
-- STEP 10: Add table partitioning comment for future migration
--
-- Orders at 100M rows need monthly partitioning. PostgreSQL 10+ supports
-- declarative partitioning. This is pre-applied as a comment so the team
-- knows the target schema.
-- ============================================================================

COMMENT ON TABLE "orders" IS
  'At 10M+ rows, migrate to monthly PARTITION BY RANGE ("createdAt"). See migration plan in docs/partitioning.md. Current design: unpartitioned.';

-- ============================================================================
-- STEP 11: Update product averageRating via trigger
--
-- Rather than computing averageRating in application code (O(n) per query),
-- maintain it via trigger when reviews change.
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE "products" p
    SET
      "averageRating" = (
        SELECT COALESCE(ROUND(AVG(r."rating")::numeric, 1), 0)
        FROM "reviews" r
        WHERE r."productId" = COALESCE(NEW."productId", OLD."productId")
          AND r."deletedAt" IS NULL
          AND r."isActive" = true
      ),
      "reviewCount" = (
        SELECT COUNT(*)
        FROM "reviews" r
        WHERE r."productId" = COALESCE(NEW."productId", OLD."productId")
          AND r."deletedAt" IS NULL
          AND r."isActive" = true
      )
    WHERE p."id" = COALESCE(NEW."productId", OLD."productId");
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "products" p
    SET
      "averageRating" = (
        SELECT COALESCE(ROUND(AVG(r."rating")::numeric, 1), 0)
        FROM "reviews" r
        WHERE r."productId" = OLD."productId"
          AND r."deletedAt" IS NULL
          AND r."isActive" = true
      ),
      "reviewCount" = (
        SELECT COUNT(*)
        FROM "reviews" r
        WHERE r."productId" = OLD."productId"
          AND r."deletedAt" IS NULL
          AND r."isActive" = true
      )
    WHERE p."id" = OLD."productId";
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_rating_update ON "reviews";
CREATE TRIGGER trg_review_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON "reviews"
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Seed initial values for existing products
UPDATE "products" p
SET
  "averageRating" = (
    SELECT COALESCE(ROUND(AVG(r."rating")::numeric, 1), 0)
    FROM "reviews" r
    WHERE r."productId" = p."id"
      AND r."deletedAt" IS NULL
      AND r."isActive" = true
  ),
  "reviewCount" = (
    SELECT COUNT(*)
    FROM "reviews" r
    WHERE r."productId" = p."id"
      AND r."deletedAt" IS NULL
      AND r."isActive" = true
  );

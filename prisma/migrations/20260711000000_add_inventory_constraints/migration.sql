-- Migration: Add inventory safety constraints
--
-- WHY: Defense-in-depth. Even with application-level locking (SELECT FOR UPDATE)
-- and conditional UPDATEs (WHERE stock >= quantity), a database-level CHECK
-- constraint is the last line of defense against negative inventory values.
--
-- If any code path — whether a bug, a race condition, or a manual SQL mistake —
-- tries to set stock or reservedStock to a negative value, PostgreSQL will
-- reject the INSERT/UPDATE with a check_violation error.
--
-- IMPACT:
-- - Zero performance impact: CHECK constraints are evaluated per-row on write,
--   which is negligible compared to the I/O cost of the write itself.
-- - PostgreSQL can use CHECK constraints for query optimization (e.g., knowing
--   stock >= 0 means it can skip impossible range scans).
-- - This is the industry standard for preventing overselling at the DB level.
--   Shopify, Stripe, and Amazon all enforce similar constraints.

-- Ensure stock is never negative (prevents overselling)
ALTER TABLE inventory
ADD CONSTRAINT chk_inventory_stock_non_negative
CHECK ("stock" >= 0);

-- Ensure reservedStock is never negative (prevents logic errors in reservation release)
ALTER TABLE inventory
ADD CONSTRAINT chk_inventory_reserved_stock_non_negative
CHECK ("reservedStock" >= 0);

-- Ensure reservedStock never exceeds stock (a reservation should only exist for available items)
-- This catches cases where stock was decremented without properly releasing reservations
ALTER TABLE inventory
ADD CONSTRAINT chk_inventory_reserved_lte_stock
CHECK ("reservedStock" <= "stock");

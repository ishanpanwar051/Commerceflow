# Database Design

## Schema Overview

17 tables with proper foreign keys, indexes, and constraints.

## Indexes

| Table | Index | Type |
|-------|-------|------|
| users | email | Unique |
| users | role | B-tree |
| products | name, slug, sku | Unique (slug, sku) |
| products | categoryId | B-tree |
| products | basePrice | B-tree |
| products | name + categoryId | Composite |
| products | categoryId + basePrice | Composite |
| orders | orderNumber | Unique |
| orders | userId + status | Composite |
| orders | createdAt | B-tree |
| payments | stripePaymentId | Unique |
| payments | idempotencyKey | B-tree |
| reviews | productId + rating | Composite |
| inventory | productId | Unique |
| refresh_tokens | token | Unique |
| coupons | code | Unique |

## Key Relationships

- User 1→* Address, 1→1 Cart, 1→* Order, 1→* Review
- Product *→1 Category, 1→1 Inventory
- Order 1→* OrderItem, 1→* Payment, *→1 Coupon
- Cart 1→* CartItem *→1 Product

## Soft Delete

Tables supporting soft delete: users, products, categories, addresses, orders, reviews, coupons
Column: `deletedAt DateTime?`

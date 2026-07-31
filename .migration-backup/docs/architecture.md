# CommerceFlow Architecture

## High-Level System Architecture

```
┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Nginx      │
│  (Web/Mobile)│     │  Reverse     │
└──────────────┘     │   Proxy      │
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   API Server │
                     │  (Express)   │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼────┐ ┌─────▼─────┐ ┌─────▼──────┐
       │ PostgreSQL│ │   Redis   │ │   BullMQ   │
       │           │ │  Cache/   │ │  Workers   │
       │           │ │  Session  │ │ (Email/PDF)│
       └───────────┘ └───────────┘ └────────────┘
```

## C4 Model

### Context Diagram
```
[Customer] ───▶ [CommerceFlow API] ───▶ [Stripe]
                                   │
                                   └──▶ [Email Service]
```

### Container Diagram
```
[Single-Page App] ───▶ [API Container] ───▶ [Database]
                         │    │
                         │    └──▶ [Cache]
                         └──▶ [Queue Workers]
```

### Component Diagram
```
API Container:
┌─────────────────────────────────────┐
│  Routes → Controllers → Services    │
│       → Repositories → Prisma → DB │
│                                     │
│  Middleware: Auth, Validate, Cache, │
│  Idempotency, Rate Limit, Audit     │
└─────────────────────────────────────┘
```

## Request Lifecycle

```
Request → Nginx → Express → requestId Middleware
  → Rate Limiter → Auth (JWT verify)
  → Validation (Zod) → Controller
  → Service → Repository → Prisma → DB
  → Response (with cache headers)
```

## Authentication Flow

```
Register → Hash password (bcrypt, 12 rounds)
         → Create user in DB
         → Generate email verification token
         → Queue email job
         → Return JWT access + refresh tokens

Login → Verify password → Generate tokens
     → Save refresh token in DB
     → Return accessToken + refreshToken

Refresh → Verify refresh token signature
       → Check not revoked/expired
       → Revoke old refresh token
       → Issue new token pair (rotation)
```

## Payment Flow

```
Checkout → Create Order (PENDING)
        → Create Stripe PaymentIntent
        → Return clientSecret to frontend
        → Frontend confirms payment via Stripe Elements
        → Stripe sends webhook → payment_intent.succeeded
        → Webhook handler confirms payment
        → Order status → CONFIRMED
        → Queue order confirmation email
        → Decrement inventory
```

## Order Processing Flow

```
PENDING → CONFIRMED (payment success)
       → PROCESSING (admin action)
       → SHIPPED (admin action)
       → DELIVERED (admin action)

Cancel allowed only in PENDING or CONFIRMED status
Cancel → Restore inventory stock
```

## Queue Processing Flow

```
API Server                          Worker Process
    │                                    │
    ├── addJob('order-confirmation')─────▶
    │                                    ├── Process email
    │                                    ├── Update job_record status
    │                                    └── Complete/fail
    │
    ├── addJob('invoice-generation')────▶
    │                                    ├── Generate PDF
    │                                    └── Store/email
    │
    └── addJob('low-stock')─────────────▶
                                         └── Notify admin
```

## Database Design (ER)

```
Users 1──* Addresses
Users 1──1 Cart
Carts 1──* CartItems
CartItems *──1 Products
Products *──1 Categories
Products 1──1 Inventory
Products *──* WishlistItems
Products *──* Reviews
Orders *──1 Users
Orders *──* OrderItems
OrderItems *──1 Products
Orders 1──* Payments
Orders *──1 Coupons
Orders *──1 Address (shipping)
Orders *──1 Address (billing)
```

## Deployment Architecture

```
Production:
┌──────────────┐
│   AWS ECS    │
│  or K8s      │
│              │
│  ┌────────┐  │     ┌──────────┐
│  │ API    │──┼────▶│ RDS      │
│  │(2+ replicas)│   │ PostgreSQL│
│  └────────┘  │     └──────────┘
│  ┌────────┐  │     ┌──────────┐
│  │Worker  │──┼────▶│ ElastiCache│
│  └────────┘  │     │ (Redis)  │
│  ┌────────┐  │     └──────────┘
│  │ Nginx  │  │
│  └────────┘  │
└──────────────┘
```

## Security Architecture

- Helmet for HTTP headers
- CORS whitelist
- Rate limiting per IP
- JWT with short-lived access tokens (15m)
- Refresh token rotation (prevents replay)
- bcrypt (12 rounds) for passwords
- SQL injection protection via Prisma (parameterized queries)
- XSS protection via helmet
- Environment-based secrets
- Stripe webhook signature verification
- Input validation at router level (Zod)

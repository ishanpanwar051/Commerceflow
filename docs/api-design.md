# API Design

## Base URL
```
/api/v1
```

## Authentication
All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

## Idempotency
POST/PATCH requests support idempotency:
```
Idempotency-Key: <uuid>
```

## Pagination
List endpoints support:
```
?page=1&limit=10&sort=createdAt&order=desc
```

## Response Format
Success:
```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10, "hasNext": true, "hasPrev": false }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": { "field": ["error message"] }
}
```

## Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register user |
| POST | /auth/login | No | Login |
| POST | /auth/refresh | No | Refresh token |
| POST | /auth/logout | Yes | Logout |
| POST | /auth/forgot-password | No | Request password reset |
| POST | /auth/reset-password | No | Reset password |
| POST | /auth/verify-email/:token | No | Verify email |
| POST | /auth/change-password | Yes | Change password |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /users/profile | Yes | Get profile |
| PATCH | /users/profile | Yes | Update profile |
| POST | /users/avatar | Yes | Upload avatar |
| DELETE | /users/account | Yes | Delete account |
| GET | /users/addresses | Yes | List addresses |
| POST | /users/addresses | Yes | Create address |
| PATCH | /users/addresses/:id | Yes | Update address |
| DELETE | /users/addresses/:id | Yes | Delete address |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /products | No | List products |
| GET | /products/:idOrSlug | No | Get product |
| POST | /products | Admin | Create product |
| PATCH | /products/:id | Admin | Update product |
| DELETE | /products/:id | Admin | Delete product |
| POST | /products/:id/images | Admin | Add image |
| DELETE | /products/:id/images/:imageId | Admin | Delete image |

### Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /categories | No | List categories |
| GET | /categories/:id | No | Get category |
| POST | /categories | Admin | Create category |
| PATCH | /categories/:id | Admin | Update category |
| DELETE | /categories/:id | Admin | Delete category |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /cart | Yes | Get cart |
| POST | /cart/items | Yes | Add item |
| PATCH | /cart/items/:productId | Yes | Update quantity |
| DELETE | /cart/items/:productId | Yes | Remove item |
| DELETE | /cart | Yes | Clear cart |
| POST | /cart/apply-coupon | Yes | Apply coupon |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /orders/checkout | Yes | Checkout |
| GET | /orders | Yes | List orders |
| GET | /orders/:id | Yes | Get order |
| POST | /orders/:id/cancel | Yes | Cancel order |
| GET | /orders/admin/all | Admin | List all orders |
| PATCH | /orders/admin/:id/status | Admin | Update status |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /payments/create-payment-intent | Yes | Create intent |
| POST | /payments/confirm | Yes | Confirm payment |
| POST | /payments/webhook | No | Stripe webhook |
| GET | /payments/history | Yes | Payment history |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /reviews/product/:productId | No | List reviews |
| POST | /reviews/product/:productId | Yes | Add review |
| PATCH | /reviews/:id | Yes | Update review |
| DELETE | /reviews/:id | Yes | Delete review |

### Wishlist
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /wishlist | Yes | Get wishlist |
| POST | /wishlist | Yes | Add item |
| DELETE | /wishlist/:productId | Yes | Remove item |

### Coupons
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /coupons | Admin | Create coupon |
| GET | /coupons | Admin | List coupons |
| DELETE | /coupons/:id | Admin | Delete coupon |
| POST | /coupons/validate | Yes | Validate coupon |

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Basic health |
| GET | /health/live | No | Liveness probe |
| GET | /health/ready | No | Readiness probe |

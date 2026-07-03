# Commerceflow Routes & Pages Reference

## Complete Routes Map

### 🏠 Public Routes (No Authentication Required)

#### Root & Navigation
| Route | File | Component | Description |
|-------|------|-----------|-------------|
| `/` | `app/page.tsx` | Redirect | Redirects to `/(customer)` |
| `/` | `app/(customer)/page.tsx` | HomePage | Main landing page with hero and featured products |

#### Product Pages
| Route | File | Description |
|-------|------|-------------|
| `/products` | `app/(customer)/products/page.tsx` | Product listing with search, filters, pagination |
| `/products/[id]` | `app/(customer)/products/[id]/page.tsx` | Individual product detail page |

#### Other Public Pages
| Route | File | Description |
|-------|------|-------------|
| `/about` | `app/(customer)/about/page.tsx` | Company information and details |

---

### 🔐 Authentication Routes

#### Login & Registration
| Route | File | Description |
|-------|------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | User login with email and password |
| `/register` | `app/(auth)/register/page.tsx` | New user registration form |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Password reset request |

**Layout**: `app/(auth)/layout.tsx` - Minimal layout for auth pages

---

### 🛒 Shopping Routes (Protected)

#### Cart & Checkout
| Route | File | Description | Requires Auth |
|-------|------|-------------|---------------|
| `/cart` | `app/(customer)/cart/page.tsx` | Shopping cart items, update quantities | ✅ Yes |
| `/checkout` | `app/(customer)/checkout/page.tsx` | Checkout flow with payment | ✅ Yes |
| `/order-confirmation` | `app/(customer)/order-confirmation/page.tsx` | Order success page with tracking | ✅ Yes |

---

### 👤 Account Routes (Protected)

**Base Layout**: `app/(customer)/account/layout.tsx` - Sidebar navigation for account pages

#### User Account Pages
| Route | File | Description | Requires Auth |
|-------|------|-------------|---------------|
| `/account/profile` | `app/(customer)/account/profile/page.tsx` | Edit user profile information | ✅ Yes |
| `/account/orders` | `app/(customer)/account/orders/page.tsx` | View order history and details | ✅ Yes |
| `/account/addresses` | `app/(customer)/account/addresses/page.tsx` | Manage shipping addresses | ✅ Yes |
| `/account/settings` | `app/(customer)/account/settings/page.tsx` | Account settings and preferences | ✅ Yes |

---

## Layout Hierarchy

```
app/layout.tsx (Root)
├── Providers (Redux, Theme)
│
├── (auth)/layout.tsx
│   ├── /login
│   ├── /register
│   └── /forgot-password
│
└── (customer)/layout.tsx (Header, Footer)
    ├── page.tsx (Home)
    ├── /about
    │
    ├── /products/page.tsx
    └── /products/[id]/page.tsx
    │
    ├── /cart
    ├── /checkout
    └── /order-confirmation
    │
    └── /account/layout.tsx (Sidebar)
        ├── /profile
        ├── /orders
        ├── /addresses
        └── /settings
```

---

## Route Groups Explanation

### `(auth)` - Authentication Group
- Minimal layout (no header/footer)
- Public access
- All auth-related pages
- Shows login/register/password reset forms

### `(customer)` - Customer Group
- Full layout with header and footer
- Includes public product pages
- Includes protected account pages
- Main shopping experience

---

## Protected Routes & Redirect Logic

### Routes Protected by Middleware
- `/cart` → Redirects to `/login` if not authenticated
- `/checkout` → Redirects to `/login` if not authenticated
- `/order-confirmation` → Redirects to `/login` if not authenticated
- All `/account/*` routes → Redirect to `/login` if not authenticated

### Redirect Destinations
| Scenario | Redirect To |
|----------|------------|
| Not logged in, access protected route | `/login` |
| After login | `/` (home) or return to intended page |
| After logout | `/login` |
| After successful registration | `/login` |
| Failed payment | `/checkout` (with error message) |

---

## Dynamic Routes

### Product Detail Route
```
/products/[id]
├── id parameter from URL
├── Fetches product data from API
└── Dynamic rendering based on product ID
```

### Query Parameters

#### Products Page
- `?search=keyword` - Search filter
- `?category=id` - Category filter
- `?minPrice=0&maxPrice=1000` - Price range
- `?page=2` - Pagination

#### Checkout
- `?step=1|2|3` - Checkout step
- `?coupon=code` - Discount code

---

## API Integration Points

### Product Browsing
```
GET /api/v1/products?search=&category=&minPrice=&maxPrice=&page=1
GET /api/v1/products/:id
GET /api/v1/categories
```

### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Shopping & Orders
```
POST /api/v1/orders (Create order)
GET /api/v1/orders (Get user orders)
GET /api/v1/orders/:id (Get order details)
```

### User Account
```
GET /api/v1/users/me (Get current user)
PUT /api/v1/users/me (Update profile)
GET /api/v1/users/addresses (Get addresses)
POST /api/v1/users/addresses (Add address)
PUT /api/v1/users/addresses/:id (Update address)
DELETE /api/v1/users/addresses/:id (Delete address)
```

---

## Navigation Methods

### Programmatic Navigation
```tsx
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/products");
router.push("/account/profile");
```

### Link Component
```tsx
import Link from "next/link";

<Link href="/products">Browse Products</Link>
<Link href="/account/profile">My Profile</Link>
```

### Header Navigation
- Home → `/`
- Products → `/products`
- Cart → `/cart`
- Profile (if logged in) → `/account/profile`
- Logout (if logged in) → Clears auth and redirects to `/login`

---

## Status Codes & Error Handling

### Successful Redirects
- 307/308 - Temporary redirect (preserves method)
- 302/303 - Temporary redirect (changes to GET)

### Error Scenarios
| Status | Route | Behavior |
|--------|-------|----------|
| 401 | Any protected route | Redirect to `/login` |
| 404 | Any non-existent route | Show 404 page |
| 500 | Any route | Show error page |

---

## Route File Examples

### Simple Page
```tsx
// app/(customer)/about/page.tsx
export default function AboutPage() {
  return <div>About content</div>;
}
```

### Protected Page with Auth Check
```tsx
// app/(customer)/cart/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(s => s.auth);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  return <div>Cart content</div>;
}
```

### Dynamic Route with Parameters
```tsx
// app/(customer)/products/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  // Fetch product by id
  return <div>Product {id}</div>;
}
```

---

## Sitemap Structure

```
commerceflow.com/
├── / (Home)
├── /products (Products Listing)
│   └── /products/[id] (Product Detail)
├── /about (About)
│
├── /login (Login)
├── /register (Register)
└── /forgot-password (Password Reset)

/cart (Protected)
/checkout (Protected)
/order-confirmation (Protected)

/account/ (Protected)
├── /profile
├── /orders
├── /addresses
└── /settings
```

---

## SEO Considerations

### Meta Tags
- Home page: Company name, description
- Products: Product listings, category info
- Product detail: Product name, description, price
- Other: Page title and description

### Robots & Crawling
- `/admin/*` - Excluded from robots.txt
- All public pages - Allowed for crawling
- Dynamic product pages - Sitemaps for performance

---

## Future Routes (To Be Implemented)

```
# Admin Dashboard
/admin
├── /admin/dashboard
├── /admin/products
├── /admin/orders
├── /admin/users
└── /admin/analytics

# Enhanced Features
/wishlist
/reviews
/search
/recommendations
/notifications
/chat
```

---

## Quick Navigation Guide

### For Customers
1. **Browse**: `/products`
2. **View Item**: `/products/[id]`
3. **Buy**: `/cart` → `/checkout` → `/order-confirmation`
4. **Account**: `/account/profile`, `/account/orders`, etc.

### For Developers
- All routes defined in `/app` directory structure
- File-based routing (Next.js App Router)
- Route groups in parentheses `(name)`
- Dynamic routes with square brackets `[param]`
- Layouts applied automatically to child routes

---

**Routes Last Updated**: January 2026
**Total Routes**: 15 pages + infinite dynamic product pages
**Protected Routes**: 7 pages
**Public Routes**: 8 pages

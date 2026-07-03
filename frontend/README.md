# Commerceflow - Frontend

A complete, production-ready Next.js 16 e-commerce frontend with modern design, authentication, shopping cart, checkout flow, and admin dashboard.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS 4 with custom design system
- **State Management**: Redux Toolkit + React-Redux
- **Data Fetching**: TanStack Query v5 (React Query)
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Axios with JWT interceptors
- **Animations**: Framer Motion
- **Theme**: next-themes with dark mode support
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth layout route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (customer)/              # Customer layout route group
│   │   ├── page.tsx             # Home page
│   │   ├── products/            # Products listing & search
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout process
│   │   ├── account/             # User account pages
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   ├── addresses/
│   │   │   └── settings/
│   │   └── about/
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles & design tokens
│   └── providers.tsx            # Redux & Theme providers
├── components/
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Sidebar.tsx
│   ├── products/                # Product-related components
│   │   └── ProductCard.tsx
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── store.ts                 # Redux store configuration
│   ├── slices/                  # Redux slices
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── userSlice.ts
│   │   └── uiSlice.ts
│   ├── api/
│   │   ├── client.ts            # Axios client with interceptors
│   │   └── types.ts             # API response types
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useUser.ts
│   │   ├── useCategories.ts
│   │   └── useRedux.ts
│   └── utils/                   # Utility functions
│       └── formatting.ts
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- npm or pnpm

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

3. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Features

### Authentication
- User login with email and password
- User registration with validation
- Password reset flow
- JWT token management with auto-refresh
- Protected routes with middleware

### Shopping
- Browse all products with search
- Filter by category and price range
- Product detail pages with reviews
- Add to cart with quantity management
- Shopping cart persistence
- Checkout process with shipping and billing

### User Account
- User profile management
- Order history and tracking
- Saved addresses (multiple)
- Account settings and preferences
- Password change

### Admin Dashboard (Expandable)
- Product management (CRUD)
- Order management
- User management
- Analytics and reports

### UI/UX
- Responsive design (mobile-first)
- Dark mode support
- Smooth animations with Framer Motion
- Loading states and skeletons
- Comprehensive error handling
- Toast notifications
- Accessibility features (ARIA labels, keyboard navigation)

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Type checking with TypeScript
```

## State Management

### Redux Store
- **auth**: Authentication state, tokens, current user
- **cart**: Shopping cart items and totals
- **user**: User profile and preferences
- **ui**: Theme, modals, notifications

### Server State (TanStack Query)
- Products with caching
- Orders and order details
- Categories
- Reviews and ratings
- User addresses

## API Integration

Backend API: `http://localhost:4000/api/v1`

## Design System

### Colors (Dark/Light Mode)
- **Primary**: Indigo - Main actions and highlights
- **Secondary**: Slate - Secondary elements
- **Destructive**: Red - Dangerous actions
- **Muted**: Gray - Disabled and secondary text

### Typography
- **Font**: Inter
- **Scale**: Tailwind typography scale
- **Line Height**: 1.4-1.6 for body text

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t commerceflow-frontend .
docker run -p 3000:3000 commerceflow-frontend
```

## Contributing

1. Create a feature branch
2. Commit changes with clear messages
3. Push and create a pull request
4. Follow the existing code style

## Support

For issues and questions, please open a GitHub issue with a detailed description.

# Commerceflow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Step 3: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 📋 What You Get

### Pages Ready to Use
- **Home** `/` - Landing page with featured products
- **Products** `/products` - Browse & search products
- **Product Detail** `/products/[id]` - View product information
- **Login** `/login` - User login
- **Register** `/register` - New user registration
- **Forgot Password** `/forgot-password` - Password reset
- **Cart** `/cart` - Shopping cart
- **Checkout** `/checkout` - Purchase flow
- **Account** `/account/profile` - User profile
- **Orders** `/account/orders` - Order history
- **Addresses** `/account/addresses` - Manage addresses
- **Settings** `/account/settings` - Account settings
- **About** `/about` - Company information

### Features Included
✅ Authentication (Login/Register)  
✅ Product browsing & search  
✅ Shopping cart  
✅ Checkout flow  
✅ User accounts  
✅ Dark mode  
✅ Responsive design  
✅ Form validation  
✅ Error handling  

---

## 🔧 Development

### Build for Production
```bash
npm run build
npm start
```

### Code Quality
```bash
npm run lint           # ESLint
npm run type-check     # TypeScript
```

### Project Structure
```
frontend/
├── app/               # Next.js pages
├── components/        # Reusable components
├── lib/               # Redux store, API client, hooks
├── public/            # Static assets
└── README.md          # Full documentation
```

---

## 🔗 API Integration

The frontend expects a backend API at:
```
http://localhost:4000/api/v1
```

### Required Endpoints
- `POST /auth/login`
- `POST /auth/register`
- `GET /products`
- `GET /products/:id`
- `GET /categories`
- `POST /orders`
- `GET /orders`
- `GET /users/me`

See `FRONTEND_BUILD_SUMMARY.md` for complete API documentation.

---

## 🎨 Customization

### Change Colors
Edit `/app/globals.css` - Update the `:root` color variables

### Change Fonts
Edit `/app/layout.tsx` - Modify the `inter` font import

### Modify Theme
Edit `/tailwind.config.ts` - Update the theme configuration

---

## 📱 Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## 🚨 Troubleshooting

### Page Not Found
- Ensure you're visiting the correct URL
- Check that the Next.js dev server is running

### API Errors
- Verify backend is running on `http://localhost:4000`
- Check CORS configuration in backend
- Confirm `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Styling Issues
- Hard refresh browser (Ctrl+Shift+R)
- Clear Next.js cache: Check `node_modules/.next`

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Documentation](https://redux.js.org)
- [Zod Documentation](https://zod.dev)

---

## 🤝 Support

For issues or questions:
1. Check `/frontend/README.md` for detailed documentation
2. Review `FRONTEND_BUILD_SUMMARY.md` for complete feature list
3. Check troubleshooting section above
4. Review Next.js error messages

---

## 📦 Production Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

### Docker
```bash
docker build -t commerceflow-frontend .
docker run -p 3000:3000 commerceflow-frontend
```

### Manual Deploy
```bash
npm run build
npm start
```

---

**Happy Coding! 🎉**

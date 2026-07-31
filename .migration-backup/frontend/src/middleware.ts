import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/orders',
  '/wishlist',
  '/addresses',
  '/checkout',
  '/cart',
];

// Define admin routes
const adminRoutes = [
  '/admin',
];

// Define auth routes (redirect to home if already authenticated)
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for tokens in cookies set by the client-side TokenService
  // The TokenService sets cookies so that the middleware can detect authenticated users
  const accessToken = request.cookies.get('cf_access_token')?.value;
  const refreshToken = request.cookies.get('cf_refresh_token')?.value;
  const hasTokens = !!(accessToken || refreshToken);

  // Redirect authenticated users away from auth pages
  if (hasTokens && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect routes requiring authentication
  if (!hasTokens && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes - also redirect non-admin users
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!hasTokens) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Note: In production, verify the user's role from the JWT token
    // For now, the client-side ProtectedRoute component will handle role-based access
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files, images, and API routes
    '/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};

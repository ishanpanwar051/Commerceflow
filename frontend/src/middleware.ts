import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/orders',
  '/wishlist',
  '/addresses',
  '/checkout',
];

// Define admin routes
const adminRoutes = [
  '/admin',
];

// Define auth routes (redirect to home if already authenticated)
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for tokens in cookies or headers
  // Note: This is a simplified check. In production, you might want to verify the token
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

  // Protect admin routes
  // Note: In production, you should verify the user's role from the token
  if (!hasTokens && adminRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

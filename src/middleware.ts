// AUTH_RESTRICTION_REENABLED
// Explanation: Dashboard and internal pages now require login.
// To disable again, comment out this middleware or server-side guard.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAuth, getAuthUser } from '@/lib/auth'

// These routes should remain accessible without authentication
const PUBLIC_FILES = [
  '/_next',     // Next.js assets
  '/favicon.ico', // Browser favicon
  '/static'     // Static files
];

const PUBLIC_ROUTES = new Set([
  '/login',
  '/register',
  '/api/login',
  '/api/register',
  '/api/auth/check'
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js assets and static files
  if (PUBLIC_FILES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_ROUTES.has(pathname)) {
    // Special handling for login/register pages when already authenticated
    if (['/login', '/register'].includes(pathname)) {
      const user = await getAuthUser(request);
      if (user) {
        // Already logged in - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // If trying to access root path /, redirect to dashboard if authenticated, login otherwise
  if (pathname === '/') {
    const user = await getAuthUser(request);
    return NextResponse.redirect(new URL(user ? '/dashboard' : '/login', request.url));
  }

  // All other routes require authentication
  const { user, redirect } = await requireAuth(request);
  if (redirect) return redirect;

  // User is authenticated, allow access
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except Next.js internal paths:
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /_next/scripts (JS files)
     * - favicon.ico (browser icon)
     */
    '/((?!_next/static|_next/image|favicon.ico|static).*)',
  ],
}
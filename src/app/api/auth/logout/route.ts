// AUTH_RESTRICTION_REENABLED
// Logout endpoint that clears the auth cookie and redirects to login

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Create response with redirect to login
  const response = NextResponse.redirect(new URL('/login', req.url), {
    status: 303 // See Other
  });
  
  // Clear the auth cookie
  clearAuthCookie(response);
  
  // Log the logout action
  console.log('[LOGOUT]', { at: new Date().toISOString() });
  
  return response;
}

// Also handle GET requests for direct navigation
export async function GET(req: NextRequest) {
  return POST(req);
}
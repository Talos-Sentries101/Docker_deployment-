// AUTH_RESTRICTION_REENABLED
// API endpoint to check authentication status

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  
  if (!user) {
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      user_id: user.user_id,
      name: user.name
    }
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminAuth } from '@/lib/authUtils';

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export async function POST(request: NextRequest) {
  // Verify admin authentication before refreshing session
  const authResult = await verifyAdminAuth();
  if (!authResult.authenticated && authResult.response) {
    return authResult.response;
  }

  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');

    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const newLoginTime = Date.now();
    
    const response = NextResponse.json(
      { success: true, loginTime: newLoginTime },
      { status: 200 }
    );

    // Refresh the login time cookie
    response.cookies.set('adminLoginTime', newLoginTime.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TIMEOUT / 1000, // Convert to seconds
    });

    return response;
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json(
      { success: false, error: 'Session refresh failed' },
      { status: 500 }
    );
  }
}

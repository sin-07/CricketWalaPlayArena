import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminAuth } from '@/lib/authUtils';

export async function POST(request: NextRequest) {
  // Verify admin authentication before logout
  const authResult = await verifyAdminAuth();
  if (!authResult.authenticated && authResult.response) {
    return authResult.response;
  }

  try {
    const cookieStore = await cookies();
    
    // Clear admin cookies by setting them with past expiry
    cookieStore.delete('adminToken');
    cookieStore.delete('adminLoginTime');

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Also set cookies to expire immediately in response
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('adminLoginTime', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

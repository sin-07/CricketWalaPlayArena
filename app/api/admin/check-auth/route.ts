import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');
    const loginTime = cookieStore.get('adminLoginTime');

    if (!adminToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Verify token format (basic validation)
    try {
      const decoded = Buffer.from(adminToken.value, 'base64').toString();
      if (!decoded.includes(':')) {
        return NextResponse.json(
          { authenticated: false },
          { status: 200 }
        );
      }
    } catch {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        authenticated: true,
        loginTime: loginTime ? parseInt(loginTime.value) : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}

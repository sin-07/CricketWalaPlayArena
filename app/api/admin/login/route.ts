import { NextRequest, NextResponse } from 'next/server';

// Simple admin authentication (in production, use proper auth with hashed passwords and database)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      const loginTime = Date.now();

      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Login successful' 
        },
        { status: 200 }
      );

      // Set HTTP-only cookies for secure storage
      response.cookies.set('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TIMEOUT / 1000, // 2 hours in seconds
      });

      response.cookies.set('adminLoginTime', loginTime.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TIMEOUT / 1000, // 2 hours in seconds
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

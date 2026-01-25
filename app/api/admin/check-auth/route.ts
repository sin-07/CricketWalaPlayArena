import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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

    // Verify JWT token and extract role
    try {
      const decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET || 'secret') as {
        username: string;
        adminId: string;
        role: string;
      };
      
      return NextResponse.json(
        { 
          authenticated: true,
          loginTime: loginTime ? parseInt(loginTime.value) : null,
          username: decoded.username,
          role: decoded.role || 'admin',
        },
        { status: 200 }
      );
    } catch (jwtError) {
      // JWT verification failed
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Auth check failed' },
      { status: 500 }
    );
  }
}

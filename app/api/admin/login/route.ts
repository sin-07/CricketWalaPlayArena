import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find admin by username (case-insensitive)
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Compare password with hashed password in database
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate a JWT token
    const token = jwt.sign(
      { 
        username: admin.username, 
        adminId: admin._id,
        role: admin.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '2h' }
    );
    const loginTime = Date.now();

    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful' 
      },
      { status: 200 }
    );

    // Set HTTP-only cookies for secure storage (not accessible via JavaScript)
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
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

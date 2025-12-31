import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// This route is used to initialize the admin user in the database
// It should only be called once during initial setup
// After setup, you can remove this file or protect it with an additional secret

export async function POST(request: NextRequest) {
  try {
    // Verify setup secret (optional security measure)
    const body = await request.json();
    const { setupSecret } = body;
    
    // You can set a SETUP_SECRET in .env.local for extra security
    const expectedSecret = process.env.SETUP_SECRET || 'cricket-box-setup-2024';
    
    if (setupSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup secret' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'rahul' });
    
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Create the admin user with hashed password
    // The password will be automatically hashed by the pre-save middleware
    const admin = await Admin.create({
      username: 'rahul',
      password: 'Rahul@123',
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user created successfully',
        username: admin.username,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}

// GET method to check if admin exists
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const adminCount = await Admin.countDocuments();
    
    return NextResponse.json({
      success: true,
      adminExists: adminCount > 0,
      count: adminCount,
    });
  } catch (error: any) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { success: false, error: 'Check failed' },
      { status: 500 }
    );
  }
}

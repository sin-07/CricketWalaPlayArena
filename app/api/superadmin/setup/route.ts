import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// Super Admin Setup - Creates the super admin user
// Super Admin Credentials:
// Username: ar2
// Password: A2r@2025

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setupSecret } = body;
    
    // Verify setup secret for security
    const expectedSecret = process.env.SUPERADMIN_SETUP_SECRET || 'cricket-box-superadmin-2025';
    
    if (setupSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup secret' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ 
      username: 'a2r',
      role: 'superadmin' 
    });
    
    if (existingSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Super admin already exists' },
        { status: 400 }
      );
    }

    // Create the super admin user
    const superAdmin = await Admin.create({
      username: 'A2r',
      password: 'A2r@2025',
      role: 'superadmin',
      isActive: true,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Super admin created successfully',
        username: superAdmin.username,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Super admin setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}

// GET method to check if super admin exists
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const superAdminCount = await Admin.countDocuments({ role: 'superadmin' });
    
    return NextResponse.json({
      success: true,
      superAdminExists: superAdminCount > 0,
      count: superAdminCount,
    });
  } catch (error: any) {
    console.error('Super admin check error:', error);
    return NextResponse.json(
      { success: false, error: 'Check failed' },
      { status: 500 }
    );
  }
}

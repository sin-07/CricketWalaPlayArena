import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// Direct insert route - use this once to create super admin
// Access: POST /api/admin/direct-setup

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if super admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { username: 'a2r' },
        { username: 'A2r' }
      ]
    });
    
    if (existingAdmin) {
      // Update to superadmin if exists
      existingAdmin.username = 'a2r'; // lowercase for matching
      existingAdmin.password = 'A2r@2025'; // Will be hashed by pre-save hook
      existingAdmin.role = 'superadmin';
      existingAdmin.isActive = true;
      
      // Trigger the pre-save hook to hash password
      existingAdmin.markModified('password');
      await existingAdmin.save();
      
      return NextResponse.json({
        success: true,
        message: 'Super admin updated successfully',
        username: 'A2r',
        note: 'Use username: A2r and password: A2r@2025',
      });
    }

    // Create new super admin
    const superAdmin = await Admin.create({
      username: 'A2r',
      password: 'A2r@2025',
      role: 'superadmin',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      username: 'A2r',
      id: superAdmin._id,
      note: 'Use username: A2r and password: A2r@2025',
    });
  } catch (error: any) {
    console.error('Direct setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Setup failed' },
      { status: 500 }
    );
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const admins = await Admin.find({}).select('username role isActive');
    
    return NextResponse.json({
      success: true,
      admins,
      count: admins.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

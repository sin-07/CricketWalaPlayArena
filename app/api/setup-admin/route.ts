import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// Direct setup to create super admin using the Admin model
// This ensures password is properly hashed via pre-save hook

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Delete any existing a2r user first
    await Admin.deleteMany({ 
      username: { $in: ['a2r', 'A2r', 'ar2'] }
    });
    
    // Create new super admin using the model (this will hash the password)
    const superAdmin = new Admin({
      username: 'a2r',
      password: 'A2r@2025',
      role: 'superadmin',
      isActive: true,
    });
    
    await superAdmin.save();
    
    // Verify it was created and password works
    const admin = await Admin.findOne({ username: 'a2r' });
    const passwordWorks = admin ? await admin.comparePassword('A2r@2025') : false;
    
    return NextResponse.json({
      success: true,
      message: 'Super Admin created successfully!',
      credentials: {
        username: 'A2r',
        password: 'A2r@2025',
      },
      verification: {
        found: !!admin,
        passwordHashWorks: passwordWorks,
        role: admin?.role,
      }
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

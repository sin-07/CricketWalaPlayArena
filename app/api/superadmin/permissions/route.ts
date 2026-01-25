import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminPermissions from '@/models/AdminPermissions';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper function to verify super admin
async function verifySuperAdmin(request: NextRequest): Promise<{ valid: boolean; username?: string }> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('adminToken');
  
  if (!adminToken) {
    return { valid: false };
  }

  try {
    const decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET || 'secret') as {
      username: string;
      role: string;
    };
    
    if (decoded.role !== 'superadmin') {
      return { valid: false };
    }
    
    return { valid: true, username: decoded.username };
  } catch {
    return { valid: false };
  }
}

// GET - Fetch current permissions
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySuperAdmin(request);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get or create default permissions
    let permissions = await AdminPermissions.findOne();
    
    if (!permissions) {
      // Create default permissions (all enabled)
      permissions = await AdminPermissions.create({
        // Coupon Management
        canCreateCoupon: true,
        canEditCoupon: true,
        canDeleteCoupon: true,
        canViewCoupons: true,
        
        // Booking Management
        canCreateBooking: true,
        canEditBooking: true,
        canDeleteBooking: true,
        canViewBookings: true,
        
        // Slot Management
        canFreezeSlots: true,
        canUnfreezeSlots: true,
        canViewSlots: true,
        
        // Newsletter Management
        canSendNewsletter: true,
        canManageSubscribers: true,
        canViewNewsletter: true,
        
        // Gallery Management
        canUploadGallery: true,
        canDeleteGallery: true,
        canViewGallery: true,
        
        // Dashboard Access
        canViewDashboard: true,
        canViewStats: true,
        
        updatedBy: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

// PUT - Update permissions
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifySuperAdmin(request);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { permissions } = body;

    if (!permissions) {
      return NextResponse.json(
        { success: false, error: 'Permissions data required' },
        { status: 400 }
      );
    }

    // Update or create permissions
    let existingPermissions = await AdminPermissions.findOne();
    
    if (existingPermissions) {
      // Update existing permissions
      Object.assign(existingPermissions, {
        ...permissions,
        updatedBy: authResult.username,
      });
      await existingPermissions.save();
    } else {
      // Create new permissions
      existingPermissions = await AdminPermissions.create({
        ...permissions,
        updatedBy: authResult.username,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      permissions: existingPermissions,
    });
  } catch (error: any) {
    console.error('Update permissions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update permissions' },
      { status: 500 }
    );
  }
}

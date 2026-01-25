import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminPermissions from '@/models/AdminPermissions';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// GET - Fetch admin permissions (accessible by both admin and super admin)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');
    
    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET || 'secret') as {
        username: string;
        role: string;
      };
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get permissions
    let permissions = await AdminPermissions.findOne();
    
    if (!permissions) {
      // Return default permissions (all enabled)
      permissions = {
        canCreateCoupon: true,
        canEditCoupon: true,
        canDeleteCoupon: true,
        canViewCoupons: true,
        canCreateBooking: true,
        canEditBooking: true,
        canDeleteBooking: true,
        canViewBookings: true,
        canFreezeSlots: true,
        canUnfreezeSlots: true,
        canViewSlots: true,
        canSendNewsletter: true,
        canManageSubscribers: true,
        canViewNewsletter: true,
        canUploadGallery: true,
        canDeleteGallery: true,
        canViewGallery: true,
        canViewDashboard: true,
        canViewStats: true,
      };
    }

    // Super admin always has all permissions
    if (decoded.role === 'superadmin') {
      return NextResponse.json({
        success: true,
        role: 'superadmin',
        permissions: {
          canCreateCoupon: true,
          canEditCoupon: true,
          canDeleteCoupon: true,
          canViewCoupons: true,
          canCreateBooking: true,
          canEditBooking: true,
          canDeleteBooking: true,
          canViewBookings: true,
          canFreezeSlots: true,
          canUnfreezeSlots: true,
          canViewSlots: true,
          canSendNewsletter: true,
          canManageSubscribers: true,
          canViewNewsletter: true,
          canUploadGallery: true,
          canDeleteGallery: true,
          canViewGallery: true,
          canViewDashboard: true,
          canViewStats: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      role: 'admin',
      permissions,
    });
  } catch (error: any) {
    console.error('Get admin permissions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

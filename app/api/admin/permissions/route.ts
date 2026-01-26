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
    
    console.log('[GET /api/admin/permissions] User:', decoded.username, 'Role:', decoded.role);
    console.log('[GET /api/admin/permissions] Permissions document:', permissions ? 'EXISTS' : 'NOT FOUND');
    
    if (!permissions) {
      // Return default permissions (all DISABLED for security)
      console.log('[GET /api/admin/permissions] WARNING: No permissions document, returning all FALSE');
      permissions = {
        canCreateCoupon: false,
        canEditCoupon: false,
        canDeleteCoupon: false,
        canViewCoupons: false,
        canCreateBooking: false,
        canEditBooking: false,
        canDeleteBooking: false,
        canViewBookings: false,
        canFreezeSlots: false,
        canUnfreezeSlots: false,
        canViewSlots: false,
        canSendNewsletter: false,
        canManageSubscribers: false,
        canViewNewsletter: false,
        canUploadGallery: false,
        canDeleteGallery: false,
        canViewGallery: false,
        canViewDashboard: false,
        canViewStats: false,
      };
    } else {
      console.log('[GET /api/admin/permissions] Permissions:', {
        canSendNewsletter: permissions.canSendNewsletter,
        canUploadGallery: permissions.canUploadGallery,
        canDeleteGallery: permissions.canDeleteGallery,
      });
    }

    // Super admin always has all permissions
    if (decoded.role === 'superadmin') {
      console.log('[GET /api/admin/permissions] User is superadmin, returning all TRUE');
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

    console.log('[GET /api/admin/permissions] Returning admin permissions');
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

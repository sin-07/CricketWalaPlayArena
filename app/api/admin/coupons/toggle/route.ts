import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkPermission } from '@/lib/permissionUtils';

export async function PATCH(request: NextRequest) {
  try {
    // Check permission to edit coupons
    const permResult = await checkPermission('canEditCoupon');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { error: permResult.error || 'You do not have permission to edit coupons' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`,
        coupon: updatedCoupon,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error toggling coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle coupon' },
      { status: 500 }
    );
  }
}

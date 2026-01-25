import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkPermission } from '@/lib/permissionUtils';

export async function DELETE(request: NextRequest) {
  try {
    // Check permission to delete coupons
    const permResult = await checkPermission('canDeleteCoupon');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { error: permResult.error || 'You do not have permission to delete coupons' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Coupon deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

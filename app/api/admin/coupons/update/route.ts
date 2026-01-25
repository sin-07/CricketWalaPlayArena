import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkPermission } from '@/lib/permissionUtils';

export async function PUT(request: NextRequest) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    // Prepare update object
    const updateData: any = {};

    // Only allow updating specific fields
    if (body.discountValue !== undefined) {
      if (body.discountValue <= 0) {
        return NextResponse.json(
          { error: 'discountValue must be greater than 0' },
          { status: 400 }
        );
      }
      updateData.discountValue = body.discountValue;
    }

    if (body.applicableSlots !== undefined) {
      updateData.applicableSlots = body.applicableSlots;
    }

    if (body.sport !== undefined) {
      updateData.sport = body.sport;
    }

    if (body.bookingType !== undefined) {
      updateData.bookingType = body.bookingType;
    }

    if (body.assignedUsers !== undefined) {
      updateData.assignedUsers = body.assignedUsers;
    }

    if (body.adminPhones !== undefined) {
      updateData.adminPhones = body.adminPhones;
    }

    if (body.minAmount !== undefined) {
      updateData.minAmount = body.minAmount;
    }

    if (body.expiryDate !== undefined) {
      updateData.expiryDate = new Date(body.expiryDate);
    }

    if (body.usageLimit !== undefined) {
      updateData.usageLimit = body.usageLimit;
    }

    if (body.perUserLimit !== undefined) {
      updateData.perUserLimit = body.perUserLimit;
    }

    if (body.showOnHomePage !== undefined) {
      updateData.showOnHomePage = body.showOnHomePage;
    }

    if (body.offerTitle !== undefined) {
      updateData.offerTitle = body.offerTitle;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: 'Coupon updated successfully',
        coupon: updatedCoupon,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

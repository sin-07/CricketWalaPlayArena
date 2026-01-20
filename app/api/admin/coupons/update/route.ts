import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Verify admin authentication
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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

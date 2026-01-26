import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkPermission } from '@/lib/permissionUtils';

export async function POST(request: NextRequest) {
  try {
    // Check permission to create coupons
    const permResult = await checkPermission('canCreateCoupon');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { error: permResult.error || 'You do not have permission to create coupons' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      applicableSlots,
      sport,
      bookingType,
      assignedUsers,
      adminPhones,
      minAmount,
      expiryDate,
      usageLimit,
      perUserLimit,
      showOnHomePage,
      offerTitle,
    } = body;

    // Validation
    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return NextResponse.json(
        {
          error: 'Missing required fields: code, discountType, discountValue, expiryDate',
        },
        { status: 400 }
      );
    }

    if (!['flat', 'percent'].includes(discountType)) {
      return NextResponse.json(
        { error: 'discountType must be "flat" or "percent"' },
        { status: 400 }
      );
    }

    if (discountValue <= 0) {
      return NextResponse.json(
        { error: 'discountValue must be greater than 0' },
        { status: 400 }
      );
    }

    if (discountType === 'percent' && discountValue > 100) {
      return NextResponse.json(
        { error: 'discountValue cannot exceed 100 for percent discount' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    // Create new coupon
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      applicableSlots: applicableSlots || [],
      sport: sport || [],
      bookingType: bookingType || 'both',
      assignedUsers: assignedUsers || [],
      adminPhones: adminPhones || ['8340296635'],
      minAmount: minAmount || 0,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || 0,
      usedCount: 0,
      perUserLimit: perUserLimit || 1,
      isActive: true,
      showOnHomePage: showOnHomePage || false,
      offerTitle: offerTitle || '',
    });

    return NextResponse.json(
      {
        message: 'Coupon created successfully',
        coupon: newCoupon,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

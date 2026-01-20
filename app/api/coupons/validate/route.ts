import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { validateCoupon } from '@/lib/couponValidation';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      code,
      bookingType,
      sport,
      date,
      slot,
      basePrice,
      userEmail,
    } = body;

    // Validate required fields
    if (!code || !bookingType || !sport || !date || !basePrice || !userEmail) {
      return NextResponse.json(
        {
          error: 'Missing required fields: code, bookingType, sport, date, basePrice, userEmail',
        },
        { status: 400 }
      );
    }

    const result = await validateCoupon(
      code,
      bookingType,
      sport,
      date,
      slot || '',
      basePrice,
      userEmail
    );

    return NextResponse.json(result, { status: result.isValid ? 200 : 400 });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

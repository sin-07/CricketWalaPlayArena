import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getUserCoupons, getSlotCoupons } from '@/lib/couponValidation';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const date = searchParams.get('date');
    const slot = searchParams.get('slot');
    const sport = searchParams.get('sport');
    const bookingType = searchParams.get('bookingType');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    let coupons;

    // If full slot info is provided, get slot-specific coupons
    if (date && slot && sport && bookingType) {
      coupons = await getSlotCoupons(
        date,
        slot,
        sport,
        bookingType as 'match' | 'practice',
        userEmail
      );
    } else {
      // Get all available coupons for user
      coupons = await getUserCoupons(userEmail);
    }

    return NextResponse.json(
      {
        coupons,
        count: coupons.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user coupons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

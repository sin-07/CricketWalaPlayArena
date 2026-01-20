import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function GET() {
  try {
    await dbConnect();

    // Fetch active coupons that should be shown on homepage
    const offers = await Coupon.find({
      isActive: true,
      showOnHomePage: true,
      expiryDate: { $gte: new Date() }, // Not expired
    })
      .select('code offerTitle discountType discountValue expiryDate')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ success: true, offers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching homepage offers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

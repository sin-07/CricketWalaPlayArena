import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkPermission } from '@/lib/permissionUtils';

export async function GET(request: NextRequest) {
  try {
    // Check permission to view coupons
    const permResult = await checkPermission('canViewCoupons');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { error: permResult.error || 'You do not have permission to view coupons' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const sport = searchParams.get('sport');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filter
    const filter: any = {};

    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }

    if (sport) {
      filter.sport = sport;
    }

    // Fetch coupons with pagination
    const skip = (page - 1) * limit;
    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Coupon.countDocuments(filter);

    return NextResponse.json(
      {
        coupons,
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { verifyAdminToken } from '@/lib/permissionUtils';

// GET - Fetch all reviews (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminToken();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'PENDING', 'APPROVED', or null for all
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (status && ['PENDING', 'APPROVED'].includes(status)) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalReviews = await Review.countDocuments(query);
    const pendingCount = await Review.countDocuments({ status: 'PENDING' });
    const approvedCount = await Review.countDocuments({ status: 'APPROVED' });

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        total: pendingCount + approvedCount,
      },
    });
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

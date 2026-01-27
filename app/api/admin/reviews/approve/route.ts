import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { verifyAdminToken } from '@/lib/permissionUtils';

// POST - Approve a review
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminToken();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.status === 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Review is already approved' },
        { status: 400 }
      );
    }

    // Approve the review
    review.status = 'APPROVED';
    review.approvedAt = new Date();
    review.approvedBy = auth.username || 'admin';
    await review.save();

    return NextResponse.json({
      success: true,
      message: 'Review approved successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve review' },
      { status: 500 }
    );
  }
}

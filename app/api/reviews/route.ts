import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

// GET - Fetch approved reviews (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Only fetch approved reviews
    const reviews = await Review.find({ status: 'APPROVED' })
      .sort({ approvedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('userName rating reviewText createdAt approvedAt')
      .lean();

    const totalReviews = await Review.countDocuments({ status: 'APPROVED' });

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const stats = avgRatingResult[0] || { avgRating: 0, count: 0 };

    // Mask user names for privacy (show only first name and initial)
    const maskedReviews = reviews.map((review) => ({
      ...review,
      userName: maskUserName(review.userName),
    }));

    return NextResponse.json({
      success: true,
      data: maskedReviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
      },
      stats: {
        averageRating: Math.round(stats.avgRating * 10) / 10,
        totalReviews: stats.count,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userName, userPhone, userEmail, bookingId, rating, reviewText } = body;

    // Validation
    if (!userName || !userPhone || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate review text length
    if (reviewText.length < 10 || reviewText.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Review must be between 10 and 500 characters' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 reviews per day per phone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewsToday = await Review.countDocuments({
      userPhone: cleanPhone,
      createdAt: { $gte: today },
    });

    if (reviewsToday >= 3) {
      return NextResponse.json(
        { success: false, error: 'You can only submit 3 reviews per day. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Check if user already reviewed this booking
    if (bookingId) {
      const existingReview = await Review.findOne({
        userPhone: cleanPhone,
        bookingId,
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: 'You have already submitted a review for this booking' },
          { status: 400 }
        );
      }
    }

    // Create the review
    const review = new Review({
      userName: userName.trim(),
      userPhone: cleanPhone,
      userEmail: userEmail?.trim().toLowerCase(),
      bookingId: bookingId || undefined,
      rating,
      reviewText: reviewText.trim(),
      status: 'PENDING',
    });

    await review.save();

    return NextResponse.json({
      success: true,
      message: 'Thank you for your review! It will be visible once approved by our team.',
      data: {
        id: review._id,
        status: review.status,
      },
    });
  } catch (error: unknown) {
    console.error('Error submitting review:', error);
    
    // Handle duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a review for this booking' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// Helper function to mask user names for privacy
function maskUserName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    // Single name - show first 3 chars + asterisks
    if (name.length <= 3) return name;
    return name.substring(0, 3) + '*'.repeat(Math.min(name.length - 3, 4));
  }
  
  // Multiple names - show first name + last initial
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastInitial}.`;
}

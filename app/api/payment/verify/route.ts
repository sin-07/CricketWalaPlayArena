import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/paymentUtils';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and update booking
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingRef,
    } = body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingRef) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required payment verification fields',
        },
        { status: 400 }
      );
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment gateway configuration error',
        },
        { status: 500 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      keySecret
    );

    if (!isValid) {
      console.error('Invalid payment signature for booking:', bookingRef);
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed. Invalid signature.',
        },
        { status: 400 }
      );
    }

    // Find and update booking with payment details
    // bookingRef might be CWPAXXXX format or MongoDB _id
    let booking;
    
    // Try to find by bookingRef format first (CWPAXXXX)
    if (bookingRef.startsWith('CWPA')) {
      // Extract the numeric part and find by MongoDB ID pattern
      const numericPart = bookingRef.substring(4); // Remove 'CWPA' prefix
      
      // Find all bookings and filter by matching reference
      const allBookings = await TurfBooking.find({});
      booking = allBookings.find(b => {
        const bookingIdStr = b._id.toString();
        const bookingNumeric = parseInt(bookingIdStr.slice(-8), 16).toString().slice(-4).padStart(4, '0');
        return `CWPA${bookingNumeric}` === bookingRef;
      });
    }
    
    // If not found, try to find by MongoDB _id directly
    if (!booking) {
      booking = await TurfBooking.findById(bookingRef);
    }

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking not found',
        },
        { status: 404 }
      );
    }

    // Update booking with payment information
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    booking.paymentStatus = 'success';
    booking.status = 'confirmed';
    
    await booking.save();

    // Generate bookingRef for response
    const bookingIdStr = booking._id.toString();
    const numericPart = parseInt(bookingIdStr.slice(-8), 16).toString().slice(-4).padStart(4, '0');
    const generatedBookingRef = `CWPA${numericPart}`;

    console.log(`✅ Payment verified for booking ${generatedBookingRef}: ${razorpayPaymentId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        bookingRef: generatedBookingRef,
        paymentId: razorpayPaymentId,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Payment verification failed',
      },
      { status: 500 }
    );
  }
}

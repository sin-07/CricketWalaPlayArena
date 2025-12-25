import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyRazorpaySignature } from '@/lib/paymentUtils';
import { sendConfirmationEmail } from '@/services/emailService';
import { sendConfirmationSMS } from '@/services/smsService';
import { ValidationError, PaymentError, NotFoundError, handleApiError } from '@/lib/apiErrors';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingRef } = body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingRef) {
      throw new ValidationError('Missing payment verification details');
    }

    // Verify Razorpay signature securely
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      process.env.RAZORPAY_KEY_SECRET || ''
    );

    if (!isValidSignature) {
      console.warn(`Invalid signature attempt for booking: ${bookingRef}`);
      throw new PaymentError('Invalid payment signature. Payment verification failed.');
    }

    // Find booking
    const booking = await Booking.findOne({ bookingRef });
    
    if (!booking) {
      console.error(`Booking not found for reference: ${bookingRef}`);
      throw new NotFoundError('Booking not found');
    }

    // Update booking with payment details
    booking.paymentStatus = 'success';
    booking.status = 'confirmed';
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    
    await booking.save();

    // Send notifications asynchronously (non-blocking)
    // Wrap in try-catch to ensure API response isn't delayed
    try {
      Promise.all([
        sendConfirmationEmail(booking),
        sendConfirmationSMS(booking),
      ]).catch((err) => {
        console.error('Error sending notifications:', err);
        // Don't throw - notifications failing shouldn't break the payment flow
      });
    } catch (err) {
      console.error('Failed to queue notifications:', err);
      // Continue - payment is verified and booking is confirmed
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingRef: booking.bookingRef,
        message: 'Payment verified successfully. Confirmation sent to your email and phone.',
        bookingId: booking._id,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

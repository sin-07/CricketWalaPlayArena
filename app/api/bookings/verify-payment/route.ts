import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyRazorpaySignature, sanitizeInput } from '@/lib/paymentUtils';
import { sendConfirmationEmail } from '@/services/emailService';
import { sendConfirmationSMS } from '@/services/smsService';
import { ValidationError, PaymentError, handleApiError } from '@/lib/apiErrors';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      bookingRef,
      bookingDetails 
    } = body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingRef || !bookingDetails) {
      throw new ValidationError('Missing payment verification details');
    }

    // Ensure timeSlotIds is always an array
    const timeSlotIds = Array.isArray(bookingDetails.timeSlotIds) 
      ? bookingDetails.timeSlotIds 
      : [bookingDetails.timeSlotIds || bookingDetails.timeSlotId];

    console.log('Verify payment - timeSlotIds received:', bookingDetails.timeSlotIds);
    console.log('Verify payment - timeSlotIds processed:', timeSlotIds);

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

    // Check if booking already exists (prevent duplicate)
    const existingBooking = await Booking.findOne({ bookingRef });
    if (existingBooking) {
      // Booking already confirmed
      return NextResponse.json({
        success: true,
        data: {
          bookingRef: existingBooking.bookingRef,
          message: 'Booking already confirmed.',
          bookingId: existingBooking._id,
        },
      });
    }

    // Check if slots are still available (final check before booking)
    // Use $or to check both timeSlotIds array and legacy timeSlotId field
    const conflictingBookings = await Booking.find({
      boxId: bookingDetails.boxId,
      date: bookingDetails.date,
      paymentStatus: 'success',
      $or: [
        { timeSlotIds: { $elemMatch: { $in: timeSlotIds } } },
        { timeSlotId: { $in: timeSlotIds } }
      ]
    });

    if (conflictingBookings.length > 0) {
      throw new ValidationError('Sorry, the selected slots were just booked by someone else. Please select different slots.');
    }

    // NOW CREATE THE BOOKING - Only after successful payment verification
    const booking = new Booking({
      boxId: bookingDetails.boxId,
      boxName: bookingDetails.boxName,
      date: bookingDetails.date,
      timeSlotId: timeSlotIds[0],
      timeSlotIds: timeSlotIds,
      customerName: sanitizeInput(bookingDetails.customerName),
      email: bookingDetails.email || `phone-${bookingDetails.phone}@booking.local`,
      phone: bookingDetails.phone,
      pricePerHour: bookingDetails.pricePerHour,
      totalAmount: bookingDetails.totalAmount,
      bookingRef,
      status: 'active',
      paymentStatus: 'success',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    await booking.save();

    // Send notifications asynchronously (non-blocking)
    try {
      Promise.all([
        sendConfirmationEmail(booking),
        sendConfirmationSMS(booking),
      ]).catch((err) => {
        console.error('Error sending notifications:', err);
      });
    } catch (err) {
      console.error('Failed to queue notifications:', err);
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingRef: booking.bookingRef,
        message: 'Payment verified and booking confirmed successfully!',
        bookingId: booking._id,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

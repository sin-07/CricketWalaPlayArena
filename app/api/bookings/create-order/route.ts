import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { validateBookingAmount, sanitizeInput, isValidPhoneNumber, isValidEmail } from '@/lib/paymentUtils';
import { ValidationError, PaymentError, handleApiError } from '@/lib/apiErrors';

// Lazy initialization to avoid build-time errors
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new PaymentError('Payment service not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      boxId,
      boxName,
      date,
      timeSlotIds,
      customerName,
      email,
      phone,
      pricePerHour,
      totalAmount,
      bookingRef,
    } = body;

    // Validate required fields
    if (!boxId || !date || !timeSlotIds || !customerName || !phone || !totalAmount || !bookingRef) {
      throw new ValidationError('Missing required fields');
    }

    // Validate date is not in the past
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (date < todayStr) {
      throw new ValidationError('Cannot book slots for past dates');
    }

    // Validate input data
    if (!isValidPhoneNumber(phone)) {
      throw new ValidationError('Invalid phone number. Please provide a 10-digit phone number.');
    }

    if (email && !isValidEmail(email)) {
      throw new ValidationError('Invalid email address');
    }

    // Validate amount calculation
    if (!validateBookingAmount(pricePerHour, timeSlotIds.length, totalAmount)) {
      throw new ValidationError('Invalid amount calculation');
    }

    // Check if slots are still available (only check confirmed bookings)
    // Use $elemMatch to properly check if any timeSlotId in the booking overlaps with requested slots
    const existingBookings = await Booking.find({
      boxId,
      date,
      paymentStatus: 'success', // Only check paid/confirmed bookings
      $or: [
        { timeSlotIds: { $elemMatch: { $in: timeSlotIds } } },
        { timeSlotId: { $in: timeSlotIds } }
      ]
    });

    if (existingBookings.length > 0) {
      throw new ValidationError('One or more selected slots are no longer available. Please refresh and try again.');
    }

    // Get Razorpay instance (will throw if not configured)
    const razorpay = getRazorpay();

    // Sanitize inputs
    const sanitizedName = sanitizeInput(customerName);
    const sanitizedEmail = email ? sanitizeInput(email) : '';

    // Create Razorpay order with minimum amount (1 INR)
    const amountInPaise = Math.max(100, Math.round(totalAmount * 100)); // Minimum 1 INR = 100 paise
    
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: bookingRef,
      notes: {
        boxId: boxId.toString(),
        boxName,
        date,
        timeSlotIds: JSON.stringify(timeSlotIds),
        customerName: sanitizedName,
        email: sanitizedEmail || phone,
        phone,
        pricePerHour: pricePerHour.toString(),
        totalAmount: totalAmount.toString(),
        bookingRef,
      },
    });

    // DO NOT save booking here - only save after successful payment
    // Just return the order details for payment

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
        bookingRef,
        // Store booking details to be used after payment verification
        bookingDetails: {
          boxId,
          boxName,
          date,
          timeSlotIds,
          customerName: sanitizedName,
          email: sanitizedEmail,
          phone,
          pricePerHour,
          totalAmount,
        },
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

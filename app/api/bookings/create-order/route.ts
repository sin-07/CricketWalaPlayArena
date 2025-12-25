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
        boxId,
        boxName,
        date,
        customerName: sanitizedName,
        email: sanitizedEmail || phone,
        phone,
        bookingRef,
      },
    });

    // Create booking document with pending payment status
    const booking = new Booking({
      boxId,
      boxName,
      date,
      timeSlotId: timeSlotIds[0],
      timeSlotIds,
      customerName: sanitizedName,
      email: sanitizedEmail || `phone-${phone}@booking.local`,
      phone,
      pricePerHour,
      totalAmount,
      bookingRef,
      status: 'active',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
        bookingRef,
        bookingId: booking._id,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

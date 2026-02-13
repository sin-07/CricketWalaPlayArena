import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { validateBookingForm } from '@/lib/bookingValidation';
import { validateSlotNotFrozen } from '@/lib/frozenSlotValidation';
import { calculateFinalPrice } from '@/lib/pricingUtils';
import { validateCoupon, incrementCouponUsage } from '@/lib/couponValidation';
import { generateBookingPDF } from '@/lib/pdfGenerator';
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/emailService';

/**
 * POST /api/turf-bookings/create
 * Create a new turf booking
 * Prevents double booking and frozen slot booking
 * Supports coupon codes with proper discount flow
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { bookingType, sport, date, slot, name, mobile, email, couponCode, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // Convert slot to array if it's a string (backward compatibility)
    const slotsArray = Array.isArray(slot) ? slot : [slot];
    
    // Validate each slot
    for (const singleSlot of slotsArray) {
      const validationErrors = validateBookingForm({
        bookingType,
        sport,
        date,
        slot: singleSlot,
        name,
        mobile,
        email,
      });

      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: validationErrors,
          },
          { status: 400 }
        );
      }
    }

    // Check if any slot is frozen
    for (const singleSlot of slotsArray) {
      const frozenSlotCheck = await Slot.findOne({
        bookingType,
        sport,
        date,
        slot: singleSlot,
        isFrozen: true,
      });

      if (frozenSlotCheck) {
        return NextResponse.json(
          {
            success: false,
            message: `Slot ${singleSlot} for ${sport} on ${date} is frozen and unavailable.`,
            field: 'slot',
          },
          { status: 403 }
        );
      }
    }

    // Check for existing bookings on any of the selected slots
    for (const singleSlot of slotsArray) {
      // Check if this exact slot is already booked
      // Handle both single slot format and comma-separated format
      console.log(`Checking slot: ${singleSlot} for ${sport} on ${date} (${bookingType})`);
      
      const existingBooking = await TurfBooking.findOne({
        date,
        $or: [
          { slot: singleSlot }, // Exact match for single slot bookings
          { slot: { $regex: new RegExp(`(^|,\\s*)${singleSlot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*,|$)`) } } // Match in comma-separated list
        ],
        sport,
        bookingType,
        status: 'confirmed',
      });

      if (existingBooking) {
        console.log(`Found existing booking:`, existingBooking.slot, existingBooking._id);
        return NextResponse.json(
          {
            success: false,
            message: `Slot ${singleSlot} is already booked for ${sport} on ${date}`,
            field: 'slot',
          },
          { status: 409 }
        );
      }
    }

    // Create new booking with coupon support
    const numSlots = slotsArray.length;
    const pricing = calculateFinalPrice(bookingType, date, numSlots);
    
    // Price calculation flow:
    // 1. Start with base price
    // 2. Apply weekly offer discount first
    // 3. Then apply coupon discount (on price after weekly discount)
    let priceAfterWeeklyDiscount = pricing.finalPrice;
    let couponDiscount = 0;
    let appliedCouponCode: string | null = null;
    let couponError: string | null = null;

    // Validate and apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(
        couponCode,
        bookingType,
        sport,
        date,
        slotsArray[0], // Pass first slot for coupon validation (coupons are per booking, not per slot)
        priceAfterWeeklyDiscount, // Validate against price after weekly discount
        email,
        mobile // Pass mobile for duplicate usage check
      );

      if (couponResult.isValid && couponResult.discount) {
        couponDiscount = couponResult.discount;
        appliedCouponCode = couponCode.toUpperCase();
      } else {
        // Store coupon error but don't fail booking
        couponError = couponResult.message;
      }
    }

    // Calculate final price: price after weekly discount - coupon discount
    const finalPriceAfterAllDiscounts = Math.max(0, priceAfterWeeklyDiscount - couponDiscount);
    
    // Total price = final price after all discounts (NO additional charges for either booking type)
    const totalPrice = finalPriceAfterAllDiscounts;

    // Payment split logic:
    // - Match (Main Turf): Pay ₹200 online as advance, rest offline at turf
    // - Practice: Pay full amount online, no offline payment
    const advancePayment = bookingType === 'match' 
      ? Math.min(Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT) || 200, totalPrice)
      : totalPrice; // Practice bookings pay full amount online
    const remainingPayment = bookingType === 'match' 
      ? Math.max(0, totalPrice - advancePayment)
      : 0; // Practice has no remaining payment

    const newBooking = new TurfBooking({
      bookingType,
      sport,
      date,
      slot: slotsArray.join(', '), // Store as comma-separated string
      name,
      mobile,
      email,
      basePrice: pricing.basePrice,
      finalPrice: finalPriceAfterAllDiscounts,
      discountPercentage: pricing.discountPercentage,
      couponCode: appliedCouponCode,
      couponDiscount: couponDiscount,
      bookingCharge: 0, // No booking charge - kept for backward compatibility
      totalPrice: totalPrice,
      advancePayment: advancePayment,
      remainingPayment: remainingPayment,
      source: 'online', // Mark as online booking
      status: 'confirmed',
      // Payment details (if provided - means payment already completed)
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
      paymentStatus: razorpayPaymentId ? 'success' : 'pending',
    });

    await newBooking.save();

    // Generate booking reference in CWPAXXXX format
    const bookingIdStr = newBooking._id.toString();
    const numericPart = parseInt(bookingIdStr.slice(-8), 16).toString().slice(-4).padStart(4, '0');
    const bookingRef = `CWPA${numericPart}`;

    // Increment coupon usage AFTER booking is saved successfully
    if (appliedCouponCode) {
      await incrementCouponUsage(
        appliedCouponCode,
        email,
        mobile,
        newBooking._id.toString()
      );
    }

    // Generate PDF and send confirmation email with booking receipt
    try {
      const pdfBuffer = await generateBookingPDF({
        bookingId: bookingRef, // Use CWPAXXXX format instead of MongoDB ObjectId
        bookingType: newBooking.bookingType,
        sport: newBooking.sport,
        date: newBooking.date,
        slot: newBooking.slot,
        name: newBooking.name,
        mobile: newBooking.mobile,
        email: newBooking.email,
        basePrice: newBooking.basePrice,
        finalPrice: newBooking.finalPrice,
        discountPercentage: newBooking.discountPercentage,
        couponCode: newBooking.couponCode,
        couponDiscount: newBooking.couponDiscount || 0,
        bookingCharge: newBooking.bookingCharge || 0,
        totalPrice: newBooking.totalPrice || 0,
        advancePayment: newBooking.advancePayment || 0,
        remainingPayment: newBooking.remainingPayment || 0,
        createdAt: newBooking.createdAt,
      });

      await sendBookingConfirmation(
        email,
        {
          bookingId: bookingRef, // Use CWPAXXXX format instead of MongoDB ObjectId
          name: newBooking.name,
          bookingType: newBooking.bookingType,
          sport: newBooking.sport,
          date: newBooking.date,
          slot: newBooking.slot,
          totalPrice: newBooking.totalPrice || 0,
          advancePayment: newBooking.advancePayment || 0,
          remainingPayment: newBooking.remainingPayment || 0,
        },
        pdfBuffer
      );
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Send admin notification email
    try {
      await sendAdminBookingNotification({
        bookingId: bookingRef,
        name: newBooking.name,
        phone: newBooking.mobile,
        email: newBooking.email,
        bookingType: newBooking.bookingType,
        sport: newBooking.sport,
        date: newBooking.date,
        slot: newBooking.slot,
        totalPrice: newBooking.totalPrice || newBooking.finalPrice,
        advancePayment: newBooking.advancePayment || 0,
        remainingPayment: newBooking.remainingPayment || 0,
        source: newBooking.source || 'online',
        couponCode: newBooking.couponCode,
        couponDiscount: newBooking.couponDiscount,
        discountPercentage: newBooking.discountPercentage,
        basePrice: newBooking.basePrice,
      });
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError);
      // Don't fail the booking if admin email fails
    }

    // Return confirmation
    return NextResponse.json(
      {
        success: true,
        message: 'Booking confirmed successfully!',
        data: {
          bookingId: newBooking._id,
          bookingRef: bookingRef, // Add booking reference in CWPAXXXX format
          bookingType: newBooking.bookingType,
          sport: newBooking.sport,
          date: newBooking.date,
          slot: newBooking.slot,
          name: newBooking.name,
          email: newBooking.email,
          basePrice: newBooking.basePrice,
          finalPrice: newBooking.finalPrice,
          discountPercentage: newBooking.discountPercentage,
          couponCode: newBooking.couponCode,
          couponDiscount: newBooking.couponDiscount,
          bookingCharge: newBooking.bookingCharge,
          totalPrice: newBooking.totalPrice,
          advancePayment: newBooking.advancePayment,
          remainingPayment: newBooking.remainingPayment,
          couponError: couponError, // Include any coupon validation error
          createdAt: newBooking.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}

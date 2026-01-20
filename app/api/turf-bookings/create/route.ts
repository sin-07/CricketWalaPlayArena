import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { validateBookingForm } from '@/lib/bookingValidation';
import { validateSlotNotFrozen } from '@/lib/frozenSlotValidation';
import { calculateFinalPrice } from '@/lib/pricingUtils';
import { validateCoupon, incrementCouponUsage } from '@/lib/couponValidation';

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
    const { bookingType, sport, date, slot, name, mobile, email, couponCode } = body;

    // Frontend validation should catch most errors, but validate on backend too
    const validationErrors = validateBookingForm({
      bookingType,
      sport,
      date,
      slot,
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

    // Check if slot is frozen
    const frozenSlotCheck = await Slot.findOne({
      bookingType,
      sport,
      date,
      slot,
      isFrozen: true,
    });

    if (frozenSlotCheck) {
      return NextResponse.json(
        {
          success: false,
          message: `This slot (${slot}) for ${sport} on ${date} is currently frozen and unavailable for booking.`,
          field: 'slot',
        },
        { status: 403 }
      );
    }

    // Check for existing booking (prevent double booking)
    const existingBooking = await TurfBooking.findOne({
      date,
      slot,
      sport,
      bookingType,
      status: 'confirmed',
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: `This slot is already booked for ${sport} on ${date}`,
          field: 'slot',
        },
        { status: 409 }
      );
    }

    // Create new booking with coupon support
    const pricing = calculateFinalPrice(bookingType, date);
    
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
        slot,
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
    const totalPrice = finalPriceAfterAllDiscounts + pricing.bookingCharge;

    const newBooking = new TurfBooking({
      bookingType,
      sport,
      date,
      slot,
      name,
      mobile,
      email,
      basePrice: pricing.basePrice,
      finalPrice: finalPriceAfterAllDiscounts,
      discountPercentage: pricing.discountPercentage,
      couponCode: appliedCouponCode,
      couponDiscount: couponDiscount,
      bookingCharge: pricing.bookingCharge,
      totalPrice: totalPrice,
      status: 'confirmed',
    });

    await newBooking.save();

    // Increment coupon usage AFTER booking is saved successfully
    if (appliedCouponCode) {
      await incrementCouponUsage(
        appliedCouponCode,
        email,
        mobile,
        newBooking._id.toString()
      );
    }

    // Return confirmation
    return NextResponse.json(
      {
        success: true,
        message: 'Booking confirmed successfully!',
        data: {
          bookingId: newBooking._id,
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

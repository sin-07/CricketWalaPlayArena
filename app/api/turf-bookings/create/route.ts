import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { validateBookingForm } from '@/lib/bookingValidation';
import { validateSlotNotFrozen } from '@/lib/frozenSlotValidation';
import { calculateFinalPrice } from '@/lib/pricingUtils';

/**
 * POST /api/turf-bookings/create
 * Create a new turf booking
 * Prevents double booking and frozen slot booking
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { bookingType, sport, date, slot, name, mobile, email } = body;

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

    // Create new booking
    const pricing = calculateFinalPrice(bookingType, date);

    const newBooking = new TurfBooking({
      bookingType,
      sport,
      date,
      slot,
      name,
      mobile,
      email,
      basePrice: pricing.basePrice,
      finalPrice: pricing.finalPrice,
      discountPercentage: pricing.discountPercentage,
      status: 'confirmed',
    });

    await newBooking.save();

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

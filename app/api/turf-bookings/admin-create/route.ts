import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { AVAILABLE_SLOTS } from '@/lib/bookingValidation';
import { calculateFinalPrice } from '@/lib/pricingUtils';

/**
 * POST /api/turf-bookings/admin-create
 * Create an offline turf booking by admin
 * These bookings will block slots for online users
 * No payment processing required
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { bookingType, sport, date, slots, name, mobile, email, paymentCollected } = body;

    // Validate required fields
    if (!bookingType || !sport || !date || !slots || slots.length === 0 || !name || !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: bookingType, sport, date, slots, name, mobile',
        },
        { status: 400 }
      );
    }

    // Validate sport
    const validSports = ['Cricket', 'Football', 'Badminton'];
    if (!validSports.includes(sport)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid sport. Must be Cricket, Football, or Badminton',
        },
        { status: 400 }
      );
    }

    // Validate booking type
    const validTypes = ['match', 'practice'];
    if (!validTypes.includes(bookingType)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid booking type. Must be match or practice',
        },
        { status: 400 }
      );
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid mobile number. Must be a valid 10-digit Indian number',
        },
        { status: 400 }
      );
    }

    // Validate slots
    const invalidSlots = slots.filter((slot: string) => !AVAILABLE_SLOTS.includes(slot));
    if (invalidSlots.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid slots: ${invalidSlots.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if any slot is frozen
    for (const singleSlot of slots) {
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
            message: `Slot ${singleSlot} for ${sport} on ${date} is frozen.`,
          },
          { status: 403 }
        );
      }
    }

    // Check for existing bookings on any of the selected slots
    for (const singleSlot of slots) {
      const existingBooking = await TurfBooking.findOne({
        date,
        $or: [
          { slot: singleSlot },
          { slot: { $regex: new RegExp(`(^|,\\s*)${singleSlot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*,|$)`) } }
        ],
        sport,
        bookingType,
        status: 'confirmed',
      });

      if (existingBooking) {
        return NextResponse.json(
          {
            success: false,
            message: `Slot ${singleSlot} is already booked for ${sport} on ${date}`,
          },
          { status: 409 }
        );
      }
    }

    // Calculate pricing
    const numSlots = slots.length;
    const pricing = calculateFinalPrice(bookingType, date, numSlots);
    
    // For offline bookings, total price is straightforward
    const totalPrice = bookingType === 'match' 
      ? pricing.finalPrice 
      : pricing.finalPrice + pricing.bookingCharge;

    // Create the offline booking
    const newBooking = new TurfBooking({
      bookingType,
      sport,
      date,
      slot: slots.join(', '), // Store as comma-separated string
      name,
      mobile,
      email: email || 'offline@cricketbox.com',
      basePrice: pricing.basePrice,
      finalPrice: pricing.finalPrice,
      discountPercentage: pricing.discountPercentage,
      couponCode: null,
      couponDiscount: 0,
      bookingCharge: pricing.bookingCharge,
      totalPrice: totalPrice,
      advancePayment: paymentCollected || 0,
      remainingPayment: Math.max(0, totalPrice - (paymentCollected || 0)),
      source: 'offline', // Mark as offline booking
      status: 'confirmed',
    });

    await newBooking.save();

    // Generate booking reference in CWPAXXXX format
    const bookingIdStr = newBooking._id.toString();
    const numericPart = parseInt(bookingIdStr.slice(-8), 16).toString().slice(-4).padStart(4, '0');
    const bookingRef = `CWPA${numericPart}`;

    console.log(`✅ Admin created offline booking: ${bookingRef} for ${name}, ${sport} on ${date}, slots: ${slots.join(', ')}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Offline booking created successfully',
        data: {
          bookingId: newBooking._id.toString(),
          bookingRef,
          bookingType,
          sport,
          date,
          slots: slots.join(', '),
          name,
          mobile,
          email: newBooking.email,
          basePrice: pricing.basePrice,
          finalPrice: pricing.finalPrice,
          discountPercentage: pricing.discountPercentage,
          totalPrice,
          paymentCollected: paymentCollected || 0,
          remainingPayment: newBooking.remainingPayment,
          source: 'offline',
          status: 'confirmed',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Admin offline booking error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'One or more slots are already booked. Please refresh and try again.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create offline booking',
      },
      { status: 500 }
    );
  }
}

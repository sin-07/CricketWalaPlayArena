import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Search bookings by various criteria
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const bookingRef = searchParams.get('bookingRef');
    const phone = searchParams.get('phone');
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');

    // At least one search parameter is required
    if (!bookingRef && !phone && !date && !timeSlot) {
      return NextResponse.json(
        { success: false, error: 'At least one search parameter is required' },
        { status: 400 }
      );
    }

    // Build dynamic query
    const query: any = {};

    if (bookingRef) {
      // Search for exact match or partial match
      query.bookingRef = { $regex: bookingRef, $options: 'i' };
    }

    if (phone) {
      query.phone = phone;
    }

    if (date) {
      query.date = date;
    }

    if (timeSlot) {
      query.timeSlotId = parseInt(timeSlot);
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

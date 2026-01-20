import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import TurfBooking from '@/models/TurfBooking';

// Normalize Indian phone number
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let normalized = phone.replace(/\D/g, '');
  if (normalized.length >= 12 && normalized.startsWith('91')) {
    normalized = normalized.slice(2);
  } else if (normalized.length >= 13 && normalized.startsWith('091')) {
    normalized = normalized.slice(3);
  } else if (normalized.length === 11 && normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  if (normalized.length > 10) {
    normalized = normalized.slice(0, 10);
  }
  return normalized;
}

// GET - Search bookings by various criteria (searches both old and new booking systems)
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

    // Build dynamic query for old booking system
    const query: any = {};

    if (bookingRef) {
      query.bookingRef = { $regex: bookingRef, $options: 'i' };
    }

    if (phone) {
      query.phone = normalizePhoneNumber(phone);
    }

    if (date) {
      query.date = date;
    }

    if (timeSlot) {
      query.timeSlotId = parseInt(timeSlot);
    }

    // Build dynamic query for new turf booking system
    const turfQuery: any = {};

    if (bookingRef) {
      turfQuery._id = { $regex: bookingRef, $options: 'i' };
    }

    if (phone) {
      turfQuery.mobile = normalizePhoneNumber(phone);
    }

    if (date) {
      turfQuery.date = date;
    }

    if (timeSlot) {
      // For turf bookings, we need to search the slot string
      const searchSlot = `${parseInt(timeSlot).toString().padStart(2, '0')}:`;
      turfQuery.slot = { $regex: searchSlot, $options: 'i' };
    }

    // Fetch from both booking systems
    const [oldBookings, turfBookings] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }),
      TurfBooking.find(turfQuery).sort({ createdAt: -1})
    ]);

    // Transform turf bookings to match old booking format for consistency
    const transformedTurfBookings = turfBookings.map((booking: any) => ({
      _id: booking._id,
      bookingRef: booking._id.toString().slice(-8).toUpperCase(),
      boxName: `${booking.bookingType.toUpperCase()} - ${booking.sport}`,
      customerName: booking.name,
      email: booking.email,
      phone: booking.mobile,
      date: booking.date,
      slot: booking.slot,
      status: booking.status,
      createdAt: booking.createdAt,
      bookingType: booking.bookingType,
      sport: booking.sport,
      isTurfBooking: true
    }));

    // Combine both results
    const allBookings = [...oldBookings, ...transformedTurfBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      count: allBookings.length,
      data: allBookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

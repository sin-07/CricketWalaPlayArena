import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { AVAILABLE_SLOTS } from '@/lib/bookingValidation';

/**
 * GET /api/turf-bookings/slot-overview?date=YYYY-MM-DD
 * Admin endpoint: returns all slots for a given date across both booking types
 * with booking details (sport, booker name) and frozen status.
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const date = request.nextUrl.searchParams.get('date');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: 'Valid date (YYYY-MM-DD) is required' },
        { status: 400 }
      );
    }

    // Fetch all confirmed bookings for this date
    const bookings = await TurfBooking.find({
      date,
      status: { $in: ['confirmed', 'completed'] },
    }).select('bookingType sport slot name mobile').lean();

    // Fetch all frozen slots for this date
    const frozenSlots = await Slot.find({
      date,
      isFrozen: true,
    }).select('bookingType sport slot').lean();

    // Build lookup maps: key = `${bookingType}|${slot}`
    const bookingMap = new Map<string, { sport: string; name: string; mobile: string }>();
    for (const b of bookings) {
      // Handle multi-slot bookings (comma-separated)
      const slots = typeof b.slot === 'string' ? b.slot.split(',').map((s: string) => s.trim()) : [b.slot];
      for (const s of slots) {
        const key = `${b.bookingType}|${s}`;
        bookingMap.set(key, { sport: b.sport, name: b.name, mobile: b.mobile });
      }
    }

    const frozenMap = new Set<string>();
    const frozenSportMap = new Map<string, string>();
    for (const f of frozenSlots) {
      const key = `${f.bookingType}|${f.slot}`;
      frozenMap.add(key);
      frozenSportMap.set(key, f.sport);
    }

    // Build overview for both booking types
    const buildOverview = (bookingType: 'match' | 'practice') => {
      return AVAILABLE_SLOTS.map((slot) => {
        const key = `${bookingType}|${slot}`;
        const booking = bookingMap.get(key);
        const isFrozen = frozenMap.has(key);

        return {
          slot,
          status: booking ? 'booked' : isFrozen ? 'frozen' : 'available',
          sport: booking?.sport || (isFrozen ? frozenSportMap.get(key) : null) || null,
          bookerName: booking?.name || null,
          bookerMobile: booking?.mobile || null,
        };
      });
    };

    return NextResponse.json({
      success: true,
      date,
      match: buildOverview('match'),
      practice: buildOverview('practice'),
    });
  } catch (error) {
    console.error('Slot overview error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch slot overview' },
      { status: 500 }
    );
  }
}

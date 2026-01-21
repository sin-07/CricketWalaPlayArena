import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import Slot from '@/models/Slot';
import { AVAILABLE_SLOTS } from '@/lib/bookingValidation';
import { cleanupExpiredFrozenSlots } from '@/lib/frozenSlotValidation';

/**
 * GET /api/turf-bookings/slots
 * Fetch available slots for a specific date and sport
 * Returns all slots with booking status
 * Filters out frozen and booked slots
 * Auto-cleans expired frozen slots before fetching
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Auto-cleanup expired frozen slots
    await cleanupExpiredFrozenSlots();

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const sport = searchParams.get('sport');
    const bookingType = searchParams.get('bookingType') || 'practice';

    if (!date || !sport) {
      return NextResponse.json(
        {
          success: false,
          message: 'Date and sport parameters are required',
        },
        { status: 400 }
      );
    }

    console.log(`Fetching slots for: ${sport} - ${bookingType} on ${date}`);

    // Fetch booked slots for the given date and sport
    // Include both 'confirmed' and 'completed' status as slots are still occupied
    // Only 'cancelled' bookings should free up slots
    const bookedSlots = await TurfBooking.find({
      date,
      sport,
      bookingType,
      status: { $in: ['confirmed', 'completed'] },
    }).select('slot -_id');

    // Handle both single slots and comma-separated multi-slot bookings
    const bookedSlotsList: string[] = [];
    bookedSlots.forEach((booking) => {
      // Split comma-separated slots and trim whitespace
      const slots = booking.slot.split(',').map((s: string) => s.trim());
      bookedSlotsList.push(...slots);
    });

    console.log(`Found ${bookedSlots.length} bookings with ${bookedSlotsList.length} total slots booked:`, bookedSlotsList);

    // Fetch frozen slots for the given date and sport
    const frozenSlots = await Slot.find({
      date,
      sport,
      bookingType,
      isFrozen: true,
    }).select('slot -_id');

    const frozenSlotsList = frozenSlots.map((slot) => slot.slot);

    // Calculate available slots - exclude both booked and frozen slots
    const availableSlots = AVAILABLE_SLOTS.map((slot) => ({
      slot,
      available: !bookedSlotsList.includes(slot) && !frozenSlotsList.includes(slot),
      isBooked: bookedSlotsList.includes(slot),
      isFrozen: frozenSlotsList.includes(slot),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          date,
          sport,
          bookingType,
          slots: availableSlots,
          totalSlots: AVAILABLE_SLOTS.length,
          bookedCount: bookedSlotsList.length,
          frozenCount: frozenSlotsList.length,
          availableCount: availableSlots.filter((s) => s.available).length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch slots',
      },
      { status: 500 }
    );
  }
}

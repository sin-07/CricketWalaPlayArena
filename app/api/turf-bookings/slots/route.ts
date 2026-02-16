import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AVAILABLE_SLOTS } from '@/lib/bookingValidation';
import { cleanupExpiredFrozenSlots } from '@/lib/frozenSlotValidation';
import {
  getAllBookedSlotsForGround,
  getAllFrozenSlotsForGround,
} from '@/lib/crossSportValidation';

/**
 * GET /api/turf-bookings/slots
 * Fetch available slots for a specific date and ground type
 * Returns all slots with booking status across ALL sports (shared ground)
 * A slot booked for any sport blocks it for all other sports
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

    // ── Cross-sport slot blocking ────────────────────────────────────────────
    // Fetch booked slots across ALL sports for this ground type.
    // Since the ground is shared, a slot booked for Cricket blocks
    // Football and Badminton on the same turf.
    const bookedSlotsData = await getAllBookedSlotsForGround(
      bookingType as 'match' | 'practice',
      date
    );

    // Unique booked slot times (regardless of which sport booked them)
    const bookedSlotsList = [...new Set(bookedSlotsData.map((b) => b.slot))];

    // Build a map of slot → booking sport for informational purposes
    const bookedByMap = new Map<string, string>();
    for (const b of bookedSlotsData) {
      if (!bookedByMap.has(b.slot)) {
        bookedByMap.set(b.slot, b.sport);
      }
    }

    console.log(
      `Found ${bookedSlotsList.length} slots booked across all sports:`,
      bookedSlotsList
    );

    // ── Cross-sport frozen slot blocking ─────────────────────────────────────
    // Fetch frozen slots across ALL sports for this ground type.
    const frozenSlotsData = await getAllFrozenSlotsForGround(
      bookingType as 'match' | 'practice',
      date
    );

    const frozenSlotsList = [...new Set(frozenSlotsData.map((f) => f.slot))];

    // Build a map of slot → frozen sport for informational purposes
    const frozenByMap = new Map<string, string>();
    for (const f of frozenSlotsData) {
      if (!frozenByMap.has(f.slot)) {
        frozenByMap.set(f.slot, f.sport);
      }
    }

    // Calculate available slots - exclude both booked and frozen slots
    const availableSlots = AVAILABLE_SLOTS.map((slot) => {
      const isBooked = bookedSlotsList.includes(slot);
      const isFrozen = frozenSlotsList.includes(slot);
      return {
        slot,
        available: !isBooked && !isFrozen,
        isBooked,
        isFrozen,
        // Include which sport caused the block for display purposes
        bookedBy: isBooked ? bookedByMap.get(slot) || null : null,
        frozenBy: isFrozen ? frozenByMap.get(slot) || null : null,
      };
    });

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

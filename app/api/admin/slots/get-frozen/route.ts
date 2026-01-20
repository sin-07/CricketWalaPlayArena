import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';
import { cleanupExpiredFrozenSlots } from '@/lib/frozenSlotValidation';

/**
 * GET /api/admin/slots/get-frozen
 * Fetch all frozen slots (admin only)
 * Query params: bookingType, sport, date
 * Auto-cleans expired frozen slots (past dates and past time slots for today)
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Auto-cleanup expired frozen slots using utility function
    await cleanupExpiredFrozenSlots();

    const searchParams = request.nextUrl.searchParams;
    const bookingType = searchParams.get('bookingType');
    const sport = searchParams.get('sport');
    const date = searchParams.get('date');

    // Build query filter
    const filter: any = { isFrozen: true };

    if (bookingType) {
      if (!['match', 'practice'].includes(bookingType)) {
        return NextResponse.json(
          { success: false, message: 'Invalid booking type' },
          { status: 400 }
        );
      }
      filter.bookingType = bookingType;
    }

    if (sport) {
      if (!['Cricket', 'Football', 'Badminton'].includes(sport)) {
        return NextResponse.json(
          { success: false, message: 'Invalid sport' },
          { status: 400 }
        );
      }
      filter.sport = sport;
    }

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { success: false, message: 'Invalid date format' },
          { status: 400 }
        );
      }
      filter.date = date;
    }

    const frozenSlots = await Slot.find(filter).sort({ date: -1, slot: 1 });

    return NextResponse.json(
      {
        success: true,
        data: frozenSlots,
        count: frozenSlots.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching frozen slots:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch frozen slots',
      },
      { status: 500 }
    );
  }
}

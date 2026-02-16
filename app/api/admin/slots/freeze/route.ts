import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';
import TurfBooking from '@/models/TurfBooking';
import { checkPermission } from '@/lib/permissionUtils';

/**
 * POST /api/admin/slots/freeze
 * Admin endpoint to freeze a slot on a shared ground.
 * Since the ground is shared, freezing a slot for any sport
 * automatically blocks it for ALL sports on the same turf.
 * Only authenticated admins can freeze slots.
 */
export async function POST(request: NextRequest) {
  try {
    // Check permission to freeze slots
    const permResult = await checkPermission('canFreezeSlots');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { success: false, message: permResult.error || 'You do not have permission to freeze slots' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { bookingType, sport, date, slot } = await request.json();

    // Validate required fields
    if (!bookingType || !sport || !date || !slot) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: bookingType, sport, date, slot',
        },
        { status: 400 }
      );
    }

    // Validate booking type
    if (!['match', 'practice'].includes(bookingType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking type. Must be "match" or "practice"' },
        { status: 400 }
      );
    }

    // Validate sport
    if (!['Cricket', 'Football', 'Badminton'].includes(sport)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sport. Must be "Cricket", "Football", or "Badminton"' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format. Must be YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if this slot already has a confirmed booking on the same ground (any sport)
    const existingBooking = await TurfBooking.findOne({
      date,
      bookingType,
      status: 'confirmed',
      $or: [
        { slot },
        { slot: { $regex: new RegExp(`(^|,\\s*)${slot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*,|$)`) } },
      ],
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot freeze: Slot ${slot} already has a confirmed ${existingBooking.sport} booking on ${date}. Cancel the booking first.`,
        },
        { status: 409 }
      );
    }

    // Find or create the slot
    let frozenSlot = await Slot.findOne({
      bookingType,
      sport,
      date,
      slot,
    });

    if (!frozenSlot) {
      frozenSlot = await Slot.create({
        bookingType,
        sport,
        date,
        slot,
        isFrozen: true,
        frozenBy: 'admin',
        frozenAt: new Date(),
      });
    } else if (!frozenSlot.isFrozen) {
      frozenSlot.isFrozen = true;
      frozenSlot.frozenBy = 'admin';
      frozenSlot.frozenAt = new Date();
      await frozenSlot.save();
    } else {
      return NextResponse.json(
        { success: false, message: 'Slot is already frozen' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Slot ${slot} on ${date} has been frozen. This blocks all sports (${sport} and others) on this ground.`,
        data: frozenSlot,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error freezing slot:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to freeze slot',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';

/**
 * POST /api/admin/slots/unfreeze
 * Admin endpoint to unfreeze a slot
 * Only authenticated admins can unfreeze slots
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check admin authentication
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin token not found' },
        { status: 401 }
      );
    }

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

    // Find the slot
    const frozenSlot = await Slot.findOne({
      bookingType,
      sport,
      date,
      slot,
    });

    if (!frozenSlot) {
      return NextResponse.json(
        {
          success: false,
          message: 'Slot not found',
        },
        { status: 404 }
      );
    }

    if (!frozenSlot.isFrozen) {
      return NextResponse.json(
        { success: false, message: 'Slot is not frozen' },
        { status: 400 }
      );
    }

    // Unfreeze the slot
    frozenSlot.isFrozen = false;
    frozenSlot.frozenBy = undefined;
    frozenSlot.frozenAt = undefined;
    await frozenSlot.save();

    return NextResponse.json(
      {
        success: true,
        message: `Slot ${slot} for ${sport} on ${date} has been unfrozen`,
        data: frozenSlot,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error unfreezing slot:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to unfreeze slot',
      },
      { status: 500 }
    );
  }
}

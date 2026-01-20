import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';

/**
 * POST /api/admin/slots/freeze
 * Admin endpoint to freeze a slot
 * Only authenticated admins can freeze slots
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

    // Decode admin token to get admin ID
    let adminId = 'admin';
    try {
      const decoded = Buffer.from(adminToken.value, 'base64').toString();
      const [username] = decoded.split(':');
      adminId = username;
    } catch (error) {
      console.error('Token decode error:', error);
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

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format. Must be YYYY-MM-DD' },
        { status: 400 }
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
        frozenBy: adminId,
        frozenAt: new Date(),
      });
    } else if (!frozenSlot.isFrozen) {
      frozenSlot.isFrozen = true;
      frozenSlot.frozenBy = adminId;
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
        message: `Slot ${slot} for ${sport} on ${date} has been frozen`,
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

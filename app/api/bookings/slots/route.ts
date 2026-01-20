import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Cache configuration
const CACHE_DURATION = 60; // 60 seconds

// GET - Fetch booked slots and next available slot for a given date and box
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const boxId = searchParams.get('boxId');
    const date = searchParams.get('date');

    if (!boxId || !date) {
      return NextResponse.json(
        { success: false, error: 'boxId and date are required' },
        { status: 400 }
      );
    }

    // Get all booked slots for the date and box - only fetch necessary fields
    const bookings = await Booking.find({
      boxId: parseInt(boxId),
      date,
      status: 'active',
    }, { timeSlotId: 1, _id: 0 }) // Project only timeSlotId
      .lean() // Use lean() for better performance
      .sort({ timeSlotId: 1 });

    const bookedSlots = bookings.map(b => b.timeSlotId);

    // Find next available slot (6 AM = slot 6, 11 PM = slot 23)
    let nextAvailableSlot = null;
    for (let slotId = 6; slotId <= 23; slotId++) {
      if (!bookedSlots.includes(slotId)) {
        const startTime = `${slotId.toString().padStart(2, '0')}:00`;
        const endTime = `${(slotId + 1).toString().padStart(2, '0')}:00`;
        nextAvailableSlot = {
          id: slotId,
          time: startTime,
          label: `${startTime} - ${endTime}`,
        };
        break;
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        date,
        boxId: parseInt(boxId),
        bookedSlots,
        nextAvailableSlot,
        totalBooked: bookedSlots.length,
        totalAvailable: 18 - bookedSlots.length, // 18 slots total (6 AM to 11 PM)
      },
    });
    
    // Add caching headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`);
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

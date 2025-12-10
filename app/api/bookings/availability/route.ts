import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Get available slots for a specific box and date range
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const boxId = searchParams.get('boxId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!boxId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'boxId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // Get all bookings for the box within the date range
    const bookings = await Booking.find({
      boxId: parseInt(boxId),
      date: { $gte: startDate, $lte: endDate },
      status: 'active',
    });

    // Group booked slots by date
    const bookedSlotsByDate: { [key: string]: number[] } = {};
    bookings.forEach((booking) => {
      if (!bookedSlotsByDate[booking.date]) {
        bookedSlotsByDate[booking.date] = [];
      }
      bookedSlotsByDate[booking.date].push(booking.timeSlotId);
    });

    return NextResponse.json({
      success: true,
      data: bookedSlotsByDate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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

    // Get only CONFIRMED bookings (paymentStatus: success)
    // This ensures unpaid/cancelled bookings don't block slots
    const bookings = await Booking.find({
      boxId: parseInt(boxId),
      date: { $gte: startDate, $lte: endDate },
      paymentStatus: 'success', // Only show slots booked by confirmed payments
    });

    // Group booked slots by date
    const bookedSlotsByDate: { [key: string]: number[] } = {};
    bookings.forEach((booking) => {
      if (!bookedSlotsByDate[booking.date]) {
        bookedSlotsByDate[booking.date] = [];
      }
      // Add all time slots from the booking
      if (booking.timeSlotIds && booking.timeSlotIds.length > 0) {
        bookedSlotsByDate[booking.date].push(...booking.timeSlotIds);
      } else if (booking.timeSlotId) {
        bookedSlotsByDate[booking.date].push(booking.timeSlotId);
      }
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

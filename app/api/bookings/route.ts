import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET - Fetch all bookings or filter by query params
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const boxId = searchParams.get('boxId');
    const date = searchParams.get('date');
    const email = searchParams.get('email');

    let query: any = {};

    if (boxId) query.boxId = parseInt(boxId);
    if (date) query.date = date;
    if (email) query.email = email;

    // Get current date and hour in local timezone
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentHour = now.getHours();

    // Mark past date bookings as completed
    await Booking.updateMany(
      { date: { $lt: today }, status: 'active' },
      { $set: { status: 'completed' } }
    );

    // Mark today's bookings as completed if all time slots have passed
    // Time slots are stored as hour numbers (e.g., 6 = 06:00-07:00, 7 = 07:00-08:00)
    // A slot is considered completed when the current hour is greater than the slot end time
    const todayActiveBookings = await Booking.find({ date: today, status: 'active' });
    
    for (const booking of todayActiveBookings) {
      // Get the latest (highest) time slot from the booking
      let latestSlot = 0;
      if (booking.timeSlotIds && booking.timeSlotIds.length > 0) {
        latestSlot = Math.max(...booking.timeSlotIds);
      } else if (booking.timeSlotId) {
        latestSlot = booking.timeSlotId;
      }
      
      // The slot ends at (latestSlot + 1) hour
      // If current hour >= slot end hour, the booking is completed
      if (currentHour >= latestSlot + 1) {
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { status: 'completed' } }
        );
      }
    }

    const bookings = await Booking.find(query).sort({ date: 1, timeSlotId: 1 });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('Received booking request:', body);
    const { boxId, date, timeSlotIds } = body;

    // Validate required fields
    if (!boxId || !date || !timeSlotIds || !Array.isArray(timeSlotIds) || timeSlotIds.length === 0) {
      console.error('Validation failed:', { boxId, date, timeSlotIds });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: boxId, date, and timeSlotIds are required' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (date < todayStr) {
      return NextResponse.json(
        { success: false, error: 'Cannot create bookings for past dates' },
        { status: 400 }
      );
    }

    // Check if slots are already booked
    const existingBookings = await Booking.find({
      boxId,
      date,
      status: 'active',
      $or: [
        { timeSlotIds: { $elemMatch: { $in: timeSlotIds } } },
        { timeSlotId: { $in: timeSlotIds } }
      ]
    });

    if (existingBookings.length > 0) {
      // Get all booked slots
      const bookedSlots: number[] = [];
      existingBookings.forEach(b => {
        if (b.timeSlotIds && b.timeSlotIds.length > 0) {
          bookedSlots.push(...b.timeSlotIds.filter((s: number) => timeSlotIds.includes(s)));
        } else if (timeSlotIds.includes(b.timeSlotId)) {
          bookedSlots.push(b.timeSlotId);
        }
      });
      return NextResponse.json(
        {
          success: false,
          error: 'One or more time slots are already booked',
          bookedSlots,
        },
        { status: 400 }
      );
    }

    // Create ONE booking with all time slots (not separate bookings)
    const booking = await Booking.create({
      ...body,
      timeSlotId: timeSlotIds[0], // First slot for legacy compatibility
      timeSlotIds: timeSlotIds,   // All slots in array
      bookingRef: body.bookingRef,
      status: 'active',
      paymentStatus: 'success', // Admin bookings are pre-paid/offline
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: [booking],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

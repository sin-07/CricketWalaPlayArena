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

    // Automatically mark past bookings as completed
    const today = new Date().toISOString().split('T')[0];
    await Booking.updateMany(
      { date: { $lt: today }, status: 'active' },
      { $set: { status: 'completed' } }
    );

    const bookings = await Booking.find(query).sort({ date: 1, timeSlotId: 1 });

    console.log('GET /api/bookings - Found bookings:', bookings.length);
    console.log('Sample booking data:', bookings[0] || 'No bookings');
    console.log('First booking timeSlotId:', bookings[0]?.timeSlotId);
    console.log('First booking timeSlotIds:', bookings[0]?.timeSlotIds);

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

    // Check if slots are already booked
    const existingBookings = await Booking.find({
      boxId,
      date,
      timeSlotId: { $in: timeSlotIds },
      status: 'active',
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more time slots are already booked',
          bookedSlots: existingBookings.map(b => b.timeSlotId),
        },
        { status: 400 }
      );
    }

    // Create bookings for each time slot
    const bookings = [];
    const baseBookingRef = body.bookingRef; // Get the base reference from frontend
    
    console.log('Creating bookings for timeSlotIds:', timeSlotIds);
    
    for (let i = 0; i < timeSlotIds.length; i++) {
      const timeSlotId = timeSlotIds[i];
      // Generate unique booking ref for each slot while keeping them linked
      const uniqueBookingRef = timeSlotIds.length > 1 
        ? `${baseBookingRef}-${i + 1}` 
        : baseBookingRef;
      
      const booking = await Booking.create({
        ...body,
        timeSlotId,
        bookingRef: uniqueBookingRef,
        status: 'active',
      });
      console.log('Created booking:', {
        ref: booking.bookingRef,
        timeSlotId: booking.timeSlotId,
        timeSlotIds: booking.timeSlotIds,
      });
      bookings.push(booking);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: bookings,
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

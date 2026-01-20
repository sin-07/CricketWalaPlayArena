import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';

// GET - Fetch all turf bookings
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/turf-bookings - Starting request');
    await dbConnect();
    console.log('✅ Database connected');

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const sport = searchParams.get('sport');
    const status = searchParams.get('status');

    let query: any = {};

    if (date) query.date = date;
    if (sport) query.sport = sport;
    if (status) query.status = status;

    console.log('📊 Query parameters:', query);

    // Get current date and time
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentHour = now.getHours();

    console.log('📅 Current date:', today, 'Hour:', currentHour);

    // Mark past date bookings as completed
    console.log('🔄 Updating past bookings...');
    await TurfBooking.updateMany(
      { date: { $lt: today }, status: 'confirmed' },
      { $set: { status: 'completed' } }
    );

    // Mark today's bookings as completed if their time slot has passed
    const todayActiveBookings = await TurfBooking.find({ date: today, status: 'confirmed' });
    console.log(`📋 Found ${todayActiveBookings.length} active bookings for today`);
    
    for (const booking of todayActiveBookings) {
      // Parse slot time (e.g., "22:00-23:00")
      const slotMatch = booking.slot.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
      if (slotMatch) {
        const endHour = parseInt(slotMatch[3], 10);
        // If current hour is past the slot end time, mark as completed
        if (currentHour >= endHour) {
          await TurfBooking.updateOne(
            { _id: booking._id },
            { $set: { status: 'completed' } }
          );
        }
      }
    }

    console.log('🔍 Fetching turf bookings with query:', query);
    const bookings = await TurfBooking.find(query)
      .lean()
      .sort({ date: -1, createdAt: -1 });
    console.log(`✅ Found ${bookings.length} turf bookings`);

    return NextResponse.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/turf-bookings:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch turf bookings',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

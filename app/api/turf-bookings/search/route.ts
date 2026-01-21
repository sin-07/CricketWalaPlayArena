import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';

/**
 * GET /api/turf-bookings/search
 * Search bookings by phone number or booking reference
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const mobile = searchParams.get('mobile');
    const ref = searchParams.get('ref');

    if (!mobile && !ref) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide mobile number or booking reference',
        },
        { status: 400 }
      );
    }

    let bookings: any[] = [];

    if (mobile) {
      // Validate mobile number
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid mobile number format',
          },
          { status: 400 }
        );
      }

      // Search by mobile number
      bookings = await TurfBooking.find({ mobile })
        .sort({ createdAt: -1 })
        .lean();
    } else if (ref) {
      // Search by booking reference (CWPAXXXX format)
      // Extract the numeric part and find matching booking IDs
      const refUpper = ref.toUpperCase();
      
      if (!refUpper.startsWith('CWPA') || refUpper.length < 5) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid booking reference format. Use CWPAXXXX format.',
          },
          { status: 400 }
        );
      }

      // Get all bookings and filter by reference
      // Since ref is derived from _id, we need to check each booking
      const allBookings = await TurfBooking.find({})
        .sort({ createdAt: -1 })
        .lean();

      bookings = allBookings.filter((booking: any) => {
        const bookingIdStr = booking._id.toString();
        const numericPart = parseInt(bookingIdStr.slice(-8), 16).toString().slice(-4).padStart(4, '0');
        const bookingRef = `CWPA${numericPart}`;
        return bookingRef === refUpper;
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: bookings || [],
        count: bookings?.length || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error searching bookings:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to search bookings',
      },
      { status: 500 }
    );
  }
}

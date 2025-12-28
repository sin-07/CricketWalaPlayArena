import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Normalize Indian phone number
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let normalized = phone.replace(/\D/g, '');
  if (normalized.length >= 12 && normalized.startsWith('91')) {
    normalized = normalized.slice(2);
  } else if (normalized.length >= 13 && normalized.startsWith('091')) {
    normalized = normalized.slice(3);
  } else if (normalized.length === 11 && normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  if (normalized.length > 10) {
    normalized = normalized.slice(0, 10);
  }
  return normalized;
}

// GET - Fetch user booking history by phone number
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: 'phone or email is required' },
        { status: 400 }
      );
    }

    // Build query to search by phone or email
    const query: any = {};
    if (phone) query.phone = normalizePhoneNumber(phone);
    if (email) query.email = email;

    // Fetch all bookings for this user
    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

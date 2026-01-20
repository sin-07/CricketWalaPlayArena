import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingConfirmationEmail } from '@/services/emailService';
import { verifyAdminAuth } from '@/lib/authUtils';

/**
 * Normalizes an Indian phone number by removing prefixes and special characters
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');
  
  // Handle various prefixes
  if (normalized.length >= 12 && normalized.startsWith('91')) {
    normalized = normalized.slice(2);
  } else if (normalized.length >= 13 && normalized.startsWith('091')) {
    normalized = normalized.slice(3);
  } else if (normalized.length === 11 && normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  
  // Limit to 10 digits
  if (normalized.length > 10) {
    normalized = normalized.slice(0, 10);
  }
  
  return normalized;
}

/**
 * Validates if a phone number is a valid 10-digit Indian mobile number
 */
function isValidPhoneNumber(phone: string): boolean {
  if (!phone || !/^\d{10}$/.test(phone)) return false;
  const firstDigit = phone.charAt(0);
  return ['6', '7', '8', '9'].includes(firstDigit);
}

// POST - Create a direct booking (without payment)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      boxId, 
      boxName, 
      date, 
      timeSlotIds, 
      customerName, 
      email, 
      phone, 
      pricePerHour, 
      totalAmount, 
      bookingRef 
    } = body;

    // Validate required fields
    if (!boxId || !date || !timeSlotIds || !Array.isArray(timeSlotIds) || timeSlotIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: boxId, date, and timeSlotIds are required' },
        { status: 400 }
      );
    }

    if (!customerName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    // Email is required for online bookings
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required for booking confirmation' },
        { status: 400 }
      );
    }

    // Normalize and validate phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidPhoneNumber(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-digit Indian mobile number' },
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
      status: { $in: ['active', 'confirmed'] },
      $or: [
        { timeSlotIds: { $elemMatch: { $in: timeSlotIds } } },
        { timeSlotId: { $in: timeSlotIds } }
      ]
    });

    if (existingBookings.length > 0) {
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

    // Create booking directly with active status
    const newBooking = new Booking({
      boxId,
      boxName: boxName || `Arena ${boxId}`,
      date,
      timeSlotId: timeSlotIds[0],
      timeSlotIds,
      customerName,
      email: email || '',
      phone: normalizedPhone,
      pricePerHour: pricePerHour || 10,
      totalAmount: totalAmount || pricePerHour * timeSlotIds.length,
      bookingRef,
      status: 'active',
      paymentStatus: 'success',
      bookingType: 'online',
      createdAt: new Date(),
    });

    await newBooking.save();

    // Send confirmation email (don't block on failure)
    try {
      if (email && email.includes('@')) {
        await sendBookingConfirmationEmail({
          customerName,
          email,
          phone,
          bookingRef,
          boxName: boxName || `Arena ${boxId}`,
          date,
          timeSlotIds,
          totalAmount: totalAmount || pricePerHour * timeSlotIds.length,
          paymentStatus: 'success',
        });
        console.log('✅ Confirmation email sent to:', email);
      }
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: {
        bookingId: newBooking._id,
        bookingRef: newBooking.bookingRef,
        boxName: newBooking.boxName,
        date: newBooking.date,
        timeSlotIds: newBooking.timeSlotIds,
        customerName: newBooking.customerName,
        email: newBooking.email,
        phone: newBooking.phone,
        totalAmount: newBooking.totalAmount,
        status: newBooking.status,
      },
    });
  } catch (error: any) {
    console.error('Direct booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

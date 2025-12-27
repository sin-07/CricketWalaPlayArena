import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingConfirmationEmail } from '@/services/emailService';

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

    // Create booking directly with confirmed status
    const newBooking = new Booking({
      boxId,
      boxName: boxName || `Arena ${boxId}`,
      date,
      timeSlotId: timeSlotIds[0],
      timeSlotIds,
      customerName,
      email: email || '',
      phone,
      pricePerHour: pricePerHour || 10,
      totalAmount: totalAmount || pricePerHour * timeSlotIds.length,
      bookingRef,
      status: 'confirmed',
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

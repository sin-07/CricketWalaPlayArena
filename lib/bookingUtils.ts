import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

/**
 * Get booking status and payment details
 */
export async function getBookingStatus(bookingRef: string) {
  try {
    await dbConnect();
    const booking = await Booking.findOne({ bookingRef });
    
    if (!booking) {
      return null;
    }

    return {
      bookingRef: booking.bookingRef,
      customerName: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      bookingDate: booking.date,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.totalAmount,
      razorpayPaymentId: booking.razorpayPaymentId,
      createdAt: booking.createdAt,
    };
  } catch (error) {
    console.error('Error fetching booking status:', error);
    return null;
  }
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(phone: string) {
  try {
    await dbConnect();
    const bookings = await Booking.find({ phone }).sort({ createdAt: -1 });
    
    return bookings.map((booking) => ({
      bookingRef: booking.bookingRef,
      boxName: booking.boxName,
      date: booking.date,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.totalAmount,
      createdAt: booking.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
}

/**
 * Check if user can cancel a booking
 */
export function canCancelBooking(booking: any): boolean {
  // Can only cancel if payment is successful and booking is confirmed
  if (booking.paymentStatus !== 'success' || booking.status !== 'confirmed') {
    return false;
  }

  // Check if booking date is in future
  const bookingDate = new Date(booking.date);
  const today = new Date();
  
  return bookingDate > today;
}

/**
 * Calculate refund amount based on cancellation policy
 * Policy: Full refund if cancelled 24 hours before
 *         50% refund if cancelled 12-24 hours before
 *         0% refund if cancelled less than 12 hours before
 */
export function calculateRefundAmount(bookingDate: string, totalAmount: number): number {
  const booking = new Date(bookingDate);
  const now = new Date();
  const hoursUntilBooking = (booking.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking >= 24) {
    return totalAmount; // Full refund
  } else if (hoursUntilBooking >= 12) {
    return totalAmount * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStats(startDate?: string, endDate?: string) {
  try {
    await dbConnect();

    const query: any = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalBookings = await Booking.countDocuments(query);
    const confirmedBookings = await Booking.countDocuments({ ...query, status: 'confirmed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { ...query, paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings: totalBookings - confirmedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageBookingValue: totalRevenue[0] ? totalRevenue[0].total / confirmedBookings : 0,
    };
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return null;
  }
}

/**
 * Resend confirmation email (for user request)
 */
export async function resendConfirmation(bookingRef: string) {
  try {
    await dbConnect();
    const booking = await Booking.findOne({ bookingRef });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus !== 'success') {
      throw new Error('Can only resend confirmation for paid bookings');
    }

    // Send email
    const { sendConfirmationEmail } = await import('@/services/emailService');
    const { sendConfirmationSMS } = await import('@/services/smsService');

    const emailSent = await sendConfirmationEmail(booking);
    const smsSent = await sendConfirmationSMS(booking);

    return {
      success: true,
      emailSent,
      smsSent,
      message: 'Confirmation resent successfully',
    };
  } catch (error: any) {
    console.error('Error resending confirmation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

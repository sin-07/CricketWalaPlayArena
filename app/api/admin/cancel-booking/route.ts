import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/authUtils';
import dbConnect from '@/lib/mongodb';
import TurfBooking from '@/models/TurfBooking';
import { cookies } from 'next/headers';

// POST - Cancel a booking (admin action)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth();
    if (!authResult.authenticated && authResult.response) {
      return authResult.response;
    }

    await dbConnect();

    const body = await request.json();
    const { bookingId, cancellationReason, processRefund } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!cancellationReason || cancellationReason.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'A valid cancellation reason is required (min 3 characters)' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await TurfBooking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'This booking is already cancelled' },
        { status: 400 }
      );
    }

    // Get admin username from cookie
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');
    let adminUsername = 'admin';
    if (adminToken) {
      try {
        const decoded = Buffer.from(adminToken.value, 'base64').toString();
        adminUsername = decoded.split(':')[0] || 'admin';
      } catch {
        adminUsername = 'admin';
      }
    }

    // Determine refund applicability
    const isOnlinePayment = booking.source === 'online' && booking.paymentStatus === 'success';
    const hasPaymentId = !!booking.razorpayPaymentId;
    let refundStatus: 'not_applicable' | 'pending' | 'processed' | 'failed' = 'not_applicable';
    let refundAmount = 0;
    let refundId: string | null = null;
    let refundNotes = '';

    if (isOnlinePayment && hasPaymentId && processRefund) {
      // Attempt Razorpay refund
      try {
        const refundResult = await processRazorpayRefund(
          booking.razorpayPaymentId!,
          booking.advancePayment || booking.totalPrice || booking.finalPrice,
          `Cancellation by admin: ${cancellationReason}`
        );

        if (refundResult.success) {
          refundStatus = 'processed';
          refundAmount = refundResult.amount || 0;
          refundId = refundResult.refundId || null;
          refundNotes = `Refund processed successfully. Razorpay Refund ID: ${refundId}`;
        } else {
          refundStatus = 'failed';
          refundNotes = `Refund failed: ${refundResult.error}. Manual refund may be required.`;
        }
      } catch (refundError: any) {
        console.error('Refund processing error:', refundError);
        refundStatus = 'failed';
        refundNotes = `Refund error: ${refundError.message}. Manual refund may be required.`;
      }
    } else if (isOnlinePayment && hasPaymentId && !processRefund) {
      refundStatus = 'pending';
      refundNotes = 'Refund not processed. Admin chose not to refund at this time.';
      refundAmount = booking.advancePayment || booking.totalPrice || booking.finalPrice || 0;
    } else if (booking.source === 'offline') {
      refundStatus = 'not_applicable';
      refundNotes = 'Offline booking - no online refund applicable.';
    }

    // Update the booking status
    const updatedBooking = await TurfBooking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: adminUsername,
          cancellationReason: cancellationReason.trim(),
          refundStatus,
          refundAmount,
          refundId,
          refundNotes,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking,
        refund: {
          status: refundStatus,
          amount: refundAmount,
          refundId,
          notes: refundNotes,
        },
      },
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process Razorpay refund
 */
async function processRazorpayRefund(
  paymentId: string,
  amount: number,
  notes: string
): Promise<{ success: boolean; refundId?: string; amount?: number; error?: string }> {
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return {
      success: false,
      error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.',
    };
  }

  try {
    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        notes: {
          reason: notes,
        },
        speed: 'normal', // 'normal' for 5-7 business days, 'optimum' for instant if eligible
      }),
    });

    const data = await response.json();

    if (response.ok && data.id) {
      return {
        success: true,
        refundId: data.id,
        amount: data.amount / 100, // Convert back to rupees
      };
    } else {
      return {
        success: false,
        error: data.error?.description || data.error?.reason || 'Unknown refund error',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error during refund',
    };
  }
}

// PATCH - Process refund for a previously cancelled booking
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth();
    if (!authResult.authenticated && authResult.response) {
      return authResult.response;
    }

    await dbConnect();

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await TurfBooking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Booking must be cancelled before processing refund' },
        { status: 400 }
      );
    }

    if (booking.refundStatus === 'processed') {
      return NextResponse.json(
        { success: false, error: 'Refund has already been processed for this booking' },
        { status: 400 }
      );
    }

    if (!booking.razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: 'No payment ID found - cannot process refund for offline/unpaid bookings' },
        { status: 400 }
      );
    }

    const refundAmount = booking.advancePayment || booking.totalPrice || booking.finalPrice;
    const refundResult = await processRazorpayRefund(
      booking.razorpayPaymentId,
      refundAmount,
      `Delayed refund for cancelled booking: ${booking.cancellationReason || 'No reason provided'}`
    );

    if (refundResult.success) {
      await TurfBooking.findByIdAndUpdate(bookingId, {
        $set: {
          refundStatus: 'processed',
          refundAmount: refundResult.amount,
          refundId: refundResult.refundId,
          refundNotes: `Refund processed successfully. Razorpay Refund ID: ${refundResult.refundId}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId: refundResult.refundId,
          amount: refundResult.amount,
        },
      });
    } else {
      await TurfBooking.findByIdAndUpdate(bookingId, {
        $set: {
          refundStatus: 'failed',
          refundNotes: `Refund attempt failed: ${refundResult.error}`,
        },
      });

      return NextResponse.json(
        { success: false, error: `Refund failed: ${refundResult.error}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund', message: error.message },
      { status: 500 }
    );
  }
}

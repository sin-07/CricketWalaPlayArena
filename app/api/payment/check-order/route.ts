import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * POST /api/payment/check-order
 * Check if a Razorpay order has been paid
 * Used to recover from mobile redirect scenarios where JS state is lost
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is paid
    if (order.status === 'paid') {
      // Fetch payments for this order to get payment details
      const payments = await razorpay.orders.fetchPayments(orderId);
      const successfulPayment = payments.items?.find(
        (p: any) => p.status === 'captured' || p.status === 'authorized'
      );

      return NextResponse.json({
        success: true,
        paid: true,
        paymentId: successfulPayment?.id || null,
        orderId: order.id,
        amount: (order.amount as number) / 100,
      });
    }

    return NextResponse.json({
      success: true,
      paid: false,
      orderId: order.id,
      status: order.status,
    });
  } catch (error: any) {
    console.error('Check order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check order status' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import PaymentSettings from '@/models/PaymentSettings';

/**
 * POST /api/payment/create-order
 * Create a Razorpay order from the backend
 * This is more secure as it keeps the secret key on the server
 */
export async function POST(request: NextRequest) {
  try {
    // Check if payments are enabled before processing
    await connectDB();
    const settings = await PaymentSettings.findOne();
    
    if (settings && !settings.paymentsEnabled) {
      console.log('❌ Payment creation blocked - payments disabled by admin');
      return NextResponse.json(
        {
          success: false,
          paymentsDisabled: true,
          message: 'Payment service is temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { amount, bookingRef, customerName, email, phone } = body;

    // Validate required fields
    if (!amount || !bookingRef || !customerName || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: amount, bookingRef, customerName, phone',
        },
        { status: 400 }
      );
    }

    // Validate Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing in environment variables');
      return NextResponse.json(
        {
          success: false,
          message: 'Payment gateway configuration missing. Please contact support.',
        },
        { status: 500 }
      );
    }

    // Check if using live keys
    const isLiveMode = keyId.startsWith('rzp_live_');
    
    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // For testing with live keys, minimum amount should be 100 paise (₹1)
    // For live mode, use actual amount; for test env variable, use ₹1
    const testMode = process.env.NEXT_PUBLIC_TEST_PRICE_PER_HOUR === '1';
    let finalAmount = testMode ? 1 : amount;
    
    // Ensure minimum amount is ₹1 (100 paise) for Razorpay
    if (finalAmount < 1) {
      finalAmount = 1;
    }

    // Generate a shorter receipt (max 40 chars for Razorpay)
    const receipt = bookingRef.substring(0, 40);

    console.log(`Creating Razorpay order: ₹${finalAmount} (Live: ${isLiveMode}, Test env: ${testMode})`);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Amount in paise (integer)
      currency: 'INR',
      receipt: receipt,
      notes: {
        bookingRef: bookingRef.substring(0, 50),
        customerName: customerName.substring(0, 50),
        phone: phone.substring(0, 15),
      },
    });

    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: finalAmount,
        currency: order.currency,
        keyId: keyId,
      },
    });
  } catch (error: any) {
    console.error('❌ Razorpay order creation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Extract meaningful error message
    let errorMessage = 'Failed to create payment order';
    if (error.error?.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.error?.description || error.message,
      },
      { status: 500 }
    );
  }
}

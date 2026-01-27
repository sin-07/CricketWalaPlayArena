import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PaymentSettings from '@/models/PaymentSettings';

// Public endpoint to check if payments are enabled
export async function GET() {
  try {
    await connectDB();
    
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      // If no settings exist, payments are enabled by default
      return NextResponse.json({
        success: true,
        paymentsEnabled: true,
      });
    }

    return NextResponse.json({
      success: true,
      paymentsEnabled: settings.paymentsEnabled,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    // On error, assume payments are enabled to not block users
    return NextResponse.json({
      success: true,
      paymentsEnabled: true,
    });
  }
}

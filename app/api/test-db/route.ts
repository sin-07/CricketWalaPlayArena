import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    // Test connection
    await dbConnect();
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    console.log('✅ MongoDB state:', states[state as keyof typeof states]);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      state: states[state as keyof typeof states],
      database: mongoose.connection.name,
    });
  } catch (error: any) {
    console.error('❌ MongoDB test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

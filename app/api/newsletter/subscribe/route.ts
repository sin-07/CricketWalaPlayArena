import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { sendWelcomeEmail } from '@/lib/emailService';

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email } = body;
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingSubscriber) {
      // If subscriber exists but is inactive, reactivate
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;
        await existingSubscriber.save();
        
        // Send welcome email
        await sendWelcomeEmail(email, existingSubscriber.unsubscribeToken);
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been re-subscribed to our newsletter.',
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed to our newsletter' },
        { status: 409 }
      );
    }
    
    // Create new subscriber
    const subscriber = new NewsletterSubscriber({
      email: email.toLowerCase(),
    });
    
    await subscriber.save();
    
    // Send welcome email
    const emailResult = await sendWelcomeEmail(email, subscriber.unsubscribeToken);
    
    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Check your email for confirmation.',
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Get subscription status (for checking if email is subscribed)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const subscriber = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    return NextResponse.json({
      success: true,
      isSubscribed: !!subscriber,
    });
    
  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}

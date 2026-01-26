import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import Newsletter from '@/models/Newsletter';
import { sendNewsletterToSubscribers } from '@/lib/emailService';
import { checkPermission } from '@/lib/permissionUtils';

// GET - Get all subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check permission to view newsletter
    const permResult = await checkPermission('canViewNewsletter');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { success: false, error: permResult.error || 'You do not have permission to view newsletter' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const query = activeOnly ? { isActive: true } : {};
    
    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(query)
        .sort({ subscribedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('email isActive subscribedAt unsubscribedAt'),
      NewsletterSubscriber.countDocuments(query),
    ]);
    
    const activeCount = await NewsletterSubscriber.countDocuments({ isActive: true });
    
    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: {
          total,
          active: activeCount,
          inactive: total - activeCount,
        },
      },
    });
    
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST - Send newsletter to all active subscribers (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check permission to send newsletter
    const permResult = await checkPermission('canSendNewsletter');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { success: false, error: permResult.error || 'You do not have permission to send newsletters' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { title, subject, content } = body;
    
    // Validate input
    if (!title || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Title, subject, and content are required' },
        { status: 400 }
      );
    }
    
    // Get all active subscribers
    const subscribers = await NewsletterSubscriber.find({ isActive: true })
      .select('email unsubscribeToken');
    
    if (subscribers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active subscribers to send newsletter to' },
        { status: 400 }
      );
    }
    
    // Create newsletter record
    const newsletter = new Newsletter({
      title,
      subject,
      content,
      status: 'draft',
    });
    
    await newsletter.save();
    
    // Send emails to all subscribers
    const result = await sendNewsletterToSubscribers(
      subscribers.map(s => ({ email: s.email, unsubscribeToken: s.unsubscribeToken })),
      title,
      content
    );
    
    // Update newsletter record with results
    newsletter.status = result.failed === subscribers.length ? 'failed' : 'sent';
    newsletter.sentAt = new Date();
    newsletter.sentTo = result.sent;
    await newsletter.save();
    
    return NextResponse.json({
      success: true,
      message: `Newsletter sent successfully to ${result.sent} subscribers`,
      data: {
        sent: result.sent,
        failed: result.failed,
        total: subscribers.length,
        errors: result.errors.slice(0, 5), // Return first 5 errors only
      },
    });
    
  } catch (error) {
    console.error('Send newsletter error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a subscriber (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check permission to manage subscribers
    const permResult = await checkPermission('canManageSubscribers');
    
    if (!permResult.allowed) {
      return NextResponse.json(
        { success: false, error: permResult.error || 'You do not have permission to manage subscribers' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const result = await NewsletterSubscriber.findOneAndDelete({ 
      email: email.toLowerCase() 
    });
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Subscriber not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscriber removed successfully',
    });
    
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove subscriber' },
      { status: 500 }
    );
  }
}

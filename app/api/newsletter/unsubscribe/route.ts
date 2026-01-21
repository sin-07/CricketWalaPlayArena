import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

// GET - Unsubscribe using token (from email link)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      // Return HTML page for missing token
      return new NextResponse(
        generateUnsubscribePage(false, 'Invalid unsubscribe link. Please check your email and try again.'),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
    
    const subscriber = await NewsletterSubscriber.findOne({ 
      unsubscribeToken: token 
    });
    
    if (!subscriber) {
      return new NextResponse(
        generateUnsubscribePage(false, 'Invalid or expired unsubscribe link.'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
    
    if (!subscriber.isActive) {
      return new NextResponse(
        generateUnsubscribePage(true, 'You have already been unsubscribed from our newsletter.'),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
    
    // Unsubscribe the user
    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    
    return new NextResponse(
      generateUnsubscribePage(true, 'You have been successfully unsubscribed from our newsletter.'),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      generateUnsubscribePage(false, 'An error occurred. Please try again later.'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Generate HTML page for unsubscribe result
function generateUnsubscribePage(success: boolean, message: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cricketwalaplayarena.in';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? 'Unsubscribed' : 'Error'} - Cricket Wala Play Arena</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 25px;
          font-size: 40px;
        }
        .icon.success { background: #d1fae5; }
        .icon.error { background: #fee2e2; }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 15px;
        }
        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
          color: white;
          text-decoration: none;
          padding: 15px 35px;
          border-radius: 10px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(22, 163, 74, 0.3);
        }
        .logo {
          margin-bottom: 20px;
          font-size: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🏏</div>
        <div class="icon ${success ? 'success' : 'error'}">
          ${success ? '✓' : '✕'}
        </div>
        <h1>${success ? 'Unsubscribed Successfully' : 'Oops! Something went wrong'}</h1>
        <p>${message}</p>
        <a href="${baseUrl}" class="btn">Visit Website</a>
      </div>
    </body>
    </html>
  `;
}

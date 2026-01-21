import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

// Base URL for links
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cricketwalaplayarena.in';
};

// Email templates
export const emailTemplates = {
  // Welcome email for new subscribers
  welcome: (email: string, unsubscribeToken: string) => ({
    subject: '🏏 Welcome to Cricket Wala Play Arena Newsletter!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🏏 Cricket Wala Play Arena</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Welcome to Our Newsletter!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Thank You for Subscribing! 🎉</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              You're now part of our cricket community! Get ready to receive:
            </p>
            <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
              <li>🎯 Exclusive offers and discounts</li>
              <li>📅 New slot availability alerts</li>
              <li>🏆 Tournament announcements</li>
              <li>💡 Cricket tips and updates</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getBaseUrl()}/booking" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Book Your Slot Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Cricket Wala Play Arena, Kanti Factory, Patna, Bihar
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
              📞 +91-8340296635
            </p>
            <a href="${getBaseUrl()}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af; font-size: 12px; text-decoration: underline;">
              Unsubscribe from newsletter
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Newsletter/Offer email
  newsletter: (
    title: string,
    content: string,
    unsubscribeToken: string
  ) => ({
    subject: `🏏 ${title} - Cricket Wala Play Arena`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🏏 Cricket Wala Play Arena</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${title}</h2>
            <div style="color: #4b5563; font-size: 16px; line-height: 1.8;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getBaseUrl()}/booking" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Book Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Cricket Wala Play Arena, Kanti Factory, Patna, Bihar
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
              📞 +91-8340296635
            </p>
            <a href="${getBaseUrl()}/api/newsletter/unsubscribe?token=${unsubscribeToken}" style="color: #9ca3af; font-size: 12px; text-decoration: underline;">
              Unsubscribe from newsletter
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send single email
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"Cricket Wala Play Arena" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

// Send welcome email to new subscriber
export const sendWelcomeEmail = async (
  email: string,
  unsubscribeToken: string
): Promise<{ success: boolean; error?: string }> => {
  const template = emailTemplates.welcome(email, unsubscribeToken);
  return sendEmail(email, template.subject, template.html);
};

// Send booking confirmation email with PDF attachment
export const sendBookingConfirmation = async (
  email: string,
  bookingDetails: {
    bookingId: string;
    name: string;
    bookingType: string;
    sport: string;
    date: string;
    slot: string;
    totalPrice: number;
    advancePayment: number;
    remainingPayment: number;
  },
  pdfBuffer: Buffer
): Promise<{ success: boolean; error?: string }> => {
  const subject = `🏏 Booking Confirmed - ${bookingDetails.bookingId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🏏 Booking Confirmed!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Cricket Wala Play Arena</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${bookingDetails.name}! 👋</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your turf booking has been confirmed successfully! Here are your booking details:
          </p>
          
          <!-- Booking Details Box -->
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 25px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #065f46; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px 0; color: #064e3b; text-align: right; font-family: monospace; font-weight: bold;">${bookingDetails.bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #065f46;">Type:</td>
                <td style="padding: 8px 0; color: #064e3b; text-align: right; font-weight: 600;">${bookingDetails.bookingType.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #065f46;">Sport:</td>
                <td style="padding: 8px 0; color: #064e3b; text-align: right; font-weight: 600;">${bookingDetails.sport}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #065f46;">Date:</td>
                <td style="padding: 8px 0; color: #064e3b; text-align: right; font-weight: 600;">${bookingDetails.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #065f46;">Time:</td>
                <td style="padding: 8px 0; color: #064e3b; text-align: right; font-weight: 600;">${bookingDetails.slot}</td>
              </tr>
            </table>
          </div>
          
          <!-- Payment Details -->
          <div style="background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">💰 Payment Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #374151; font-size: 15px;">Total Amount:</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: bold; font-size: 16px;">₹${bookingDetails.totalPrice}</td>
              </tr>
              <tr style="border-top: 1px solid #bbf7d0;">
                <td style="padding: 12px 0 8px 0; color: #065f46; font-weight: bold;">✅ Paid Online:</td>
                <td style="padding: 12px 0 8px 0; color: #16a34a; text-align: right; font-weight: bold; font-size: 18px;">₹${bookingDetails.advancePayment}</td>
              </tr>
              ${
                bookingDetails.remainingPayment > 0
                  ? `<tr>
                      <td style="padding: 8px 0; color: #ea580c; font-weight: bold;">⏳ Pay at Turf:</td>
                      <td style="padding: 8px 0; color: #ea580c; text-align: right; font-weight: bold; font-size: 18px;">₹${bookingDetails.remainingPayment}</td>
                    </tr>`
                  : ''
              }
            </table>
          </div>
          
          ${
            bookingDetails.remainingPayment > 0
              ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                    <strong>💡 Important:</strong> Please pay the remaining amount of <strong>₹${bookingDetails.remainingPayment}</strong> when you visit the turf.
                  </p>
                </div>`
              : ''
          }
          
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            📎 <strong>Your detailed booking receipt is attached as a PDF.</strong>
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">See you at the turf! 🏏</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            Cricket Wala Play Arena, Kanti Factory, Patna, Bihar
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
            📞 +91-8340296635
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const attachments = [
    {
      filename: `booking-${bookingDetails.bookingId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ];
  
  return sendEmail(email, subject, html, attachments);
};

// Send newsletter to multiple subscribers
export const sendNewsletterToSubscribers = async (
  subscribers: Array<{ email: string; unsubscribeToken: string }>,
  title: string,
  content: string
): Promise<{ sent: number; failed: number; errors: string[] }> => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  const transporter = createTransporter();

  for (const subscriber of subscribers) {
    try {
      const template = emailTemplates.newsletter(title, content, subscriber.unsubscribeToken);
      
      await transporter.sendMail({
        from: `"Cricket Wala Play Arena" <${EMAIL_FROM}>`,
        to: subscriber.email,
        subject: template.subject,
        html: template.html,
      });
      
      results.sent++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.failed++;
      results.errors.push(`${subscriber.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendNewsletterToSubscribers,
  emailTemplates,
};

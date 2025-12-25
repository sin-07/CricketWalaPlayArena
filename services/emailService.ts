import nodemailer from 'nodemailer';
import { IBooking } from '@/models/Booking';

interface EmailConfig {
  service: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  // Using Gmail or custom SMTP
  const emailConfig: EmailConfig = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  };

  // Allow custom SMTP configuration
  if (process.env.SMTP_HOST) {
    emailConfig.service = '';
    emailConfig.host = process.env.SMTP_HOST;
    emailConfig.port = parseInt(process.env.SMTP_PORT || '587');
    emailConfig.secure = process.env.SMTP_SECURE === 'true';
  }

  transporter = nodemailer.createTransport(emailConfig);
  return transporter;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export async function sendConfirmationEmail(booking: IBooking): Promise<boolean> {
  try {
    // Skip if email service not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    const transporter = getTransporter();
    const emailAddress = booking.email.includes('@') ? booking.email : `${booking.phone}@booking.local`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { background-color: #f5f5f5; padding: 20px; margin-top: 20px; border-radius: 5px; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #22c55e; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed! 🎉</h1>
              <p>Your cricket arena booking has been successfully confirmed</p>
            </div>
            
            <div class="content">
              <p>Dear ${booking.customerName},</p>
              <p>Thank you for booking with Cricket Wala Play Arena. Your payment has been received and your booking is confirmed.</p>
              
              <div class="booking-details">
                <h2 style="margin-top: 0; color: #22c55e;">Booking Details</h2>
                <div class="detail-row">
                  <span class="label">Booking Reference:</span>
                  <span>${booking.bookingRef}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Arena:</span>
                  <span>${booking.boxName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span>
                  <span>${formatDate(booking.date)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Time Slots:</span>
                  <span>${booking.timeSlotIds.join(', ')}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span>₹${booking.totalAmount}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span>
                  <span style="color: green; font-weight: bold;">✓ Paid</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment ID:</span>
                  <span>${booking.razorpayPaymentId || 'N/A'}</span>
                </div>
              </div>
              
              <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time. Bring a valid ID for verification.</p>
              
              <p>If you need to make any changes or cancel your booking, please contact us at least 24 hours in advance.</p>
              
              <p>Thank you for choosing Cricket Wala Play Arena!</p>
            </div>
            
            <div class="footer">
              <p>Cricket Wala Play Arena | All Rights Reserved</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailAddress,
      subject: `Booking Confirmed - Reference: ${booking.bookingRef}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${emailAddress}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

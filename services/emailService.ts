import nodemailer from 'nodemailer';

interface BookingEmailData {
  customerName: string;
  email: string;
  phone: string;
  bookingRef: string;
  boxName: string;
  date: string;
  timeSlotIds: number[];
  totalAmount: number;
  paymentStatus?: string;
}

interface EmailConfig {
  service?: string;
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

  const emailConfig: EmailConfig = {
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  };

  // Use custom SMTP if configured, otherwise default to Gmail
  if (process.env.SMTP_HOST) {
    emailConfig.host = process.env.SMTP_HOST;
    emailConfig.port = parseInt(process.env.SMTP_PORT || '587');
    emailConfig.secure = process.env.SMTP_SECURE === 'true';
  } else {
    emailConfig.service = 'gmail';
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

function getTimeRange(slotId: number): string {
  const startHour = slotId;
  const endHour = slotId + 1;
  const startTime = `${startHour.toString().padStart(2, '0')}:00`;
  const endTime = `${endHour.toString().padStart(2, '0')}:00`;
  return `${startTime} - ${endTime}`;
}

function getFormattedTimeSlots(timeSlotIds: number[]): string {
  if (!timeSlotIds || timeSlotIds.length === 0) return 'N/A';
  const sortedSlots = [...timeSlotIds].sort((a, b) => a - b);
  return sortedSlots.map(id => getTimeRange(id)).join(', ');
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData): Promise<boolean> {
  try {
    // Skip if email service not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email service not configured. Skipping email notification.');
      console.warn('Set EMAIL_USER and EMAIL_PASSWORD in .env to enable emails.');
      return false;
    }

    // Skip if no valid email
    if (!booking.email || !booking.email.includes('@') || booking.email.includes('@booking.local')) {
      console.log('No valid email address provided. Skipping email notification.');
      return false;
    }

    const transport = getTransporter();
    const formattedDate = formatDate(booking.date);
    const formattedTimeSlots = getFormattedTimeSlots(booking.timeSlotIds);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0fdf4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px 20px; text-align: center;">
              <table width="70" height="70" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 15px auto; background: white; border-radius: 12px;">
                <tr>
                  <td align="center" valign="middle" style="font-size: 36px;">🏏</td>
                </tr>
              </table>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                Booking Confirmed!
              </h1>
              <p style="color: #dcfce7; margin: 8px 0 0 0; font-size: 14px;">
                Cricket Wala Play Arena
              </p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 25px 20px 15px 20px;">
              <p style="color: #374151; font-size: 16px; margin: 0;">
                Dear <strong>${booking.customerName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 12px 0 0 0; line-height: 1.5;">
                Congratulations! Your cricket arena slot has been successfully booked. We're excited to see you!
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 20px; background-color: #f0fdf4;">
              <h2 style="color: #166534; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #86efac; padding-bottom: 10px;">
                📋 Booking Details
              </h2>
              
              <p style="color: #6b7280; font-size: 13px; margin: 10px 0;">
                <strong>Booking Reference:</strong><br/>
                <span style="color: #166534; font-size: 14px; font-weight: bold;">${booking.bookingRef}</span>
              </p>

              <p style="color: #6b7280; font-size: 13px; margin: 10px 0;">
                <strong>🏟️ Arena:</strong><br/>
                <span style="color: #1f2937; font-size: 14px;">${booking.boxName}</span>
              </p>

              <p style="color: #6b7280; font-size: 13px; margin: 10px 0;">
                <strong>📅 Date:</strong><br/>
                <span style="color: #1f2937; font-size: 14px;">${formattedDate}</span>
              </p>

              <p style="color: #6b7280; font-size: 13px; margin: 10px 0;">
                <strong>⏰ Time Slots:</strong><br/>
                <span style="color: #1f2937; font-size: 14px;">${formattedTimeSlots}</span>
              </p>

              <p style="background-color: #166534; color: #ffffff; padding: 12px; border-radius: 6px; margin: 15px 0 0 0;">
                <strong>💰 Total Amount:</strong> <span style="font-size: 18px; font-weight: bold;">₹${booking.totalAmount}</span>
              </p>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 20px; background-color: #f9fafb;">
              <h3 style="color: #374151; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase;">
                Your Details
              </h3>
              <p style="color: #6b7280; font-size: 13px; margin: 6px 0;">
                👤 <strong>${booking.customerName}</strong>
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 6px 0;">
                📧 ${booking.email}
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 6px 0;">
                📱 ${booking.phone}
              </p>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 20px; background-color: #fef3c7;">
              <h3 style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">
                ⚠️ Important Information
              </h3>
              <p style="color: #78350f; font-size: 12px; margin: 6px 0; line-height: 1.6;">
                • Please arrive 15 minutes before your scheduled time<br/>
                • Bring a valid ID for verification<br/>
                • Slot cancellations not allowed
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #22c55e; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">
                🏏 Cricket Wala Play Arena
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                Thank you for choosing us! See you at the arena.
              </p>
              <p style="color: #9ca3af; font-size: 10px; margin: 10px 0 0 0;">
                This is an automated email. Please do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"Cricket Wala Play Arena" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Confirmed – Cricket Play Arena | Ref: ${booking.bookingRef}`,
      html: htmlContent,
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent successfully to ${booking.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return false;
  }
}

// Legacy function for backward compatibility with existing code
export async function sendConfirmationEmail(booking: any): Promise<boolean> {
  return sendBookingConfirmationEmail({
    customerName: booking.customerName,
    email: booking.email,
    phone: booking.phone,
    bookingRef: booking.bookingRef,
    boxName: booking.boxName,
    date: booking.date,
    timeSlotIds: booking.timeSlotIds || [booking.timeSlotId],
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus,
  });
}

import { IBooking } from '@/models/Booking';

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export async function sendConfirmationSMS(booking: IBooking): Promise<boolean> {
  try {
    // Skip if SMS service not configured
    if (!process.env.SMS_API_KEY) {
      console.warn('SMS service not configured. Skipping SMS notification.');
      return false;
    }

    const smsProvider = process.env.SMS_PROVIDER || 'twilio';

    const message = `Cricket Wala: Your booking is confirmed! Ref: ${booking.bookingRef} | ${booking.boxName} on ${formatDate(booking.date)} | Amount: ₹${booking.totalAmount}. Thank you!`;

    if (smsProvider === 'twilio') {
      return await sendTwilioSMS(booking.phone, message);
    } else if (smsProvider === 'aws-sns') {
      return await sendAWSSNSSMS(booking.phone, message);
    } else if (smsProvider === 'exotel') {
      return await sendExotelSMS(booking.phone, message);
    } else {
      // Generic placeholder for other SMS providers
      console.log(
        `SMS would be sent to ${booking.phone}: ${message}`
      );
      return true;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

async function sendTwilioSMS(phone: string, message: string): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured');
      return false;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `+91${phone}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error('Twilio SMS error:', response.statusText);
      return false;
    }

    console.log(`SMS sent via Twilio to +91${phone}`);
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}

async function sendAWSSNSSMS(phone: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.AWS_SNS_API_KEY;

    if (!apiKey) {
      console.warn('AWS SNS credentials not configured');
      return false;
    }

    const response = await fetch('https://sns.amazonaws.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        PhoneNumber: `+91${phone}`,
        Message: message,
      }),
    });

    if (!response.ok) {
      console.error('AWS SNS SMS error:', response.statusText);
      return false;
    }

    console.log(`SMS sent via AWS SNS to +91${phone}`);
    return true;
  } catch (error) {
    console.error('AWS SNS SMS error:', error);
    return false;
  }
}

async function sendExotelSMS(phone: string, message: string): Promise<boolean> {
  try {
    const sid = process.env.EXOTEL_SID;
    const token = process.env.EXOTEL_TOKEN;

    if (!sid || !token) {
      console.warn('Exotel credentials not configured');
      return false;
    }

    const response = await fetch(
      `https://api.exotel.com/v1/Accounts/${sid}/Sms/send.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.EXOTEL_FROM_NUMBER || '9999999999',
          To: phone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      console.error('Exotel SMS error:', response.statusText);
      return false;
    }

    console.log(`SMS sent via Exotel to ${phone}`);
    return true;
  } catch (error) {
    console.error('Exotel SMS error:', error);
    return false;
  }
}

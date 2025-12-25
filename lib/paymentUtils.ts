import crypto from 'crypto';

/**
 * Verify Razorpay payment signature
 * This ensures the payment came from Razorpay and hasn't been tampered with
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Generate a unique booking reference
 * Format: CBK-YYYYMMDD-XXXXX (CBK = Cricket Box Booking)
 */
export function generateBookingReference(): string {
  const date = new Date();
  const dateStr = date
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CBK-${dateStr}-${random}`;
}

/**
 * Validate booking amount
 * Ensures the amount matches the expected calculation
 */
export function validateBookingAmount(
  pricePerHour: number,
  numberOfSlots: number,
  totalAmount: number
): boolean {
  const expectedAmount = pricePerHour * numberOfSlots;
  return Math.abs(expectedAmount - totalAmount) < 0.01; // Allow 1 paisa difference
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

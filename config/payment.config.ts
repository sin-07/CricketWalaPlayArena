/**
 * Payment Configuration
 * All sensitive values must come from environment variables
 */

export const PAYMENT_CONFIG = {
  // Razorpay Key ID (Public, safe to expose on frontend)
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  
  // Arena information
  arenaName: 'Cricket Wala Play Arena',
  
  // Supported currencies
  currency: 'INR',
};

/**
 * Booking Status
 */
export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  MISSING_RAZORPAY_KEY: 'Razorpay configuration missing. Please contact support.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INVALID_SIGNATURE: 'Payment verification failed. Please contact support.',
  BOOKING_NOT_FOUND: 'Booking not found.',
  DATABASE_ERROR: 'Database error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Booking created. Proceeding to payment...',
  PAYMENT_SUCCESS: 'Payment successful! Your booking is confirmed.',
  NOTIFICATION_SENT: 'Confirmation sent to your email and phone.',
} as const;

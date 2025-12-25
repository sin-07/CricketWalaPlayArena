/**
 * Payment Testing Guide
 * This file provides test data and instructions for testing the payment flow
 */

export const TEST_CREDIT_CARDS = {
  SUCCESS: {
    number: '4111111111111111',
    expiry: '12/25',
    cvv: '100',
    description: 'Standard success card',
  },
  FAILURE: {
    number: '4444444444444002',
    expiry: '12/25',
    cvv: '100',
    description: 'Will fail at OTP/auth step',
  },
  INSUFFICIENT_FUNDS: {
    number: '4000000000000002',
    expiry: '12/25',
    cvv: '100',
    description: 'Insufficient funds',
  },
  LOST_CARD: {
    number: '4000002500003155',
    expiry: '12/25',
    cvv: '100',
    description: 'Card reported lost',
  },
};

export const TEST_DATA = {
  validBooking: {
    boxId: 1,
    boxName: 'Premium Box',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    timeSlotIds: [1, 2],
    customerName: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    pricePerHour: 500,
    totalAmount: 1000,
  },
  invalidPhone: {
    phone: '12345', // Too short
  },
  invalidEmail: {
    email: 'invalid-email', // Missing @
  },
};

/**
 * Testing Checklist
 */
export const TEST_CHECKLIST = {
  bookingForm: [
    '✓ Can select arena box',
    '✓ Can select date',
    '✓ Can select time slots',
    '✓ Can enter customer name',
    '✓ Can enter phone (10 digits)',
    '✓ Can enter email (optional)',
    '✓ Price displays correctly',
    '✓ Shows user booking history when phone/email entered',
  ],
  paymentFlow: [
    '✓ Clicking "Proceed to Payment" opens payment modal',
    '✓ Payment modal shows booking summary',
    '✓ Can click "Pay Now" to open Razorpay checkout',
    '✓ Razorpay Checkout loads successfully',
    '✓ Can enter card details',
    '✓ Can complete payment with test card',
  ],
  successFlow: [
    '✓ Payment success shows confirmation message',
    '✓ Booking status changes to "confirmed"',
    '✓ Email notification received (check spam folder)',
    '✓ SMS notification received (if SMS configured)',
    '✓ Booking reference shown to user',
  ],
  errorHandling: [
    '✓ Invalid phone shows error',
    '✓ Invalid email shows error',
    '✓ Missing required fields shows error',
    '✓ Payment failure shows error message',
    '✓ Network error shows retry option',
  ],
};

/**
 * Manual Testing Steps
 */
export const MANUAL_TESTING_STEPS = `
1. BOOKING FORM TEST
   - Navigate to /booking page
   - Select an arena box from dropdown
   - Select a date (should be today or future)
   - Click on at least 2 time slots
   - Enter customer name
   - Enter 10-digit phone number
   - Enter email (optional)
   - Click "Proceed to Payment"

2. PAYMENT MODAL TEST
   - Payment modal should open
   - Should show booking summary
   - Should show total amount
   - Click "Pay Now" button

3. RAZORPAY CHECKOUT TEST
   - Razorpay Checkout should open
   - Use test card: 4111111111111111
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 100)
   - Name: Any name
   - Email: Any valid email
   - Phone: Your phone number
   - Click "Pay" button

4. SUCCESS VERIFICATION
   - Should see success notification
   - Check booking status in database (should be "confirmed")
   - Check email for confirmation (check spam)
   - Check SMS if configured

5. ERROR TEST
   - Use card: 4444444444444002
   - Should see payment failed message
   - Booking should NOT be created
   - Can retry with different card

6. AMOUNT VERIFICATION
   - Calculate: pricePerHour * numberOfSlots = totalAmount
   - Verify amount matches on payment modal
   - Verify amount matches in Razorpay checkout
`;

/**
 * Database Query Helpers (for MongoDB)
 */
export const DB_QUERIES = {
  findAllBookings: 'db.bookings.find({})',
  findConfirmedBookings: 'db.bookings.find({ status: "confirmed" })',
  findPendingPayments: 'db.bookings.find({ paymentStatus: "pending" })',
  findByPhone: (phone: string) => `db.bookings.find({ phone: "${phone}" })`,
  findByEmail: (email: string) => `db.bookings.find({ email: "${email}" })`,
  findByReference: (ref: string) => `db.bookings.findOne({ bookingRef: "${ref}" })`,
};

/**
 * API Testing with cURL
 */
export const CURL_EXAMPLES = {
  createOrder: `
curl -X POST http://localhost:3000/api/bookings/create-order \\
  -H "Content-Type: application/json" \\
  -d '{
    "boxId": 1,
    "boxName": "Premium Box",
    "date": "2024-12-25",
    "timeSlotIds": [1, 2],
    "customerName": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "pricePerHour": 500,
    "totalAmount": 1000,
    "bookingRef": "CBK-20241225-TEST1"
  }'
  `,
  verifyPayment: `
curl -X POST http://localhost:3000/api/bookings/verify-payment \\
  -H "Content-Type: application/json" \\
  -d '{
    "razorpayOrderId": "order_abc123",
    "razorpayPaymentId": "pay_abc123",
    "razorpaySignature": "xxxxx",
    "bookingRef": "CBK-20241225-TEST1"
  }'
  `,
};

/**
 * Environment Check
 */
export function checkEnvironmentSetup(): {
  missing: string[];
  configured: string[];
} {
  const missing: string[] = [];
  const configured: string[] = [];

  if (!process.env.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  else configured.push('RAZORPAY_KEY_ID');

  if (!process.env.RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
  else configured.push('RAZORPAY_KEY_SECRET');

  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) missing.push('NEXT_PUBLIC_RAZORPAY_KEY_ID');
  else configured.push('NEXT_PUBLIC_RAZORPAY_KEY_ID');

  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  else configured.push('MONGODB_URI');

  if (!process.env.EMAIL_USER) missing.push('EMAIL_USER (optional)');
  else configured.push('EMAIL_USER');

  if (!process.env.EMAIL_PASSWORD) missing.push('EMAIL_PASSWORD (optional)');
  else configured.push('EMAIL_PASSWORD');

  return { missing, configured };
}

import mongoose, { Document, Schema } from 'mongoose';

export interface ITurfBooking extends Document {
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string; // YYYY-MM-DD format
  slot: string; // e.g., "06:00-07:00" or slot ID
  name: string;
  mobile: string; // 10-digit mobile number
  email: string;
  basePrice: number; // Price before any discount
  finalPrice: number; // Price after all discounts (weekly + coupon)
  discountPercentage: number; // Weekly offer discount applied
  couponCode?: string; // Applied coupon code (if any)
  couponDiscount?: number; // Discount amount from coupon
  bookingCharge?: number; // Booking processing charge
  totalPrice?: number; // Final total: finalPrice + bookingCharge
  advancePayment?: number; // Amount paid online (for match bookings)
  remainingPayment?: number; // Amount to be paid offline at turf
  source: 'online' | 'offline'; // Booking source - online or admin offline booking
  status: 'confirmed' | 'cancelled' | 'completed';
  razorpayOrderId?: string; // Razorpay order ID
  razorpayPaymentId?: string; // Razorpay payment ID
  razorpaySignature?: string; // Razorpay signature
  paymentStatus?: 'pending' | 'success' | 'failed'; // Payment status
  cancelledAt?: Date; // When the booking was cancelled
  cancelledBy?: string; // Admin username who cancelled
  cancellationReason?: string; // Reason for cancellation
  refundStatus?: 'not_applicable' | 'pending' | 'processed' | 'failed'; // Refund status
  refundAmount?: number; // Amount refunded
  refundId?: string; // Razorpay refund ID
  refundNotes?: string; // Additional refund notes
  createdAt: Date;
  updatedAt: Date;
}

const TurfBookingSchema = new Schema<ITurfBooking>(
  {
    bookingType: {
      type: String,
      enum: ['match', 'practice'],
      required: [true, 'Booking type is required'],
    },
    sport: {
      type: String,
      enum: ['Cricket', 'Football', 'Badminton'],
      required: [true, 'Sport is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    slot: {
      type: String,
      required: [true, 'Slot is required'],
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Mobile number must be a valid 10-digit Indian number'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      lowercase: true,
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: [true, 'Final price is required'],
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    advancePayment: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingPayment: {
      type: Number,
      default: 0,
      min: 0,
    },
    source: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
      maxlength: [500, 'Cancellation reason must not exceed 500 characters'],
    },
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'processed', 'failed'],
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundId: {
      type: String,
      default: null,
    },
    refundNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient cross-sport queries on the same ground
TurfBookingSchema.index({ date: 1, bookingType: 1, status: 1 });

// Query performance index for slot lookups
TurfBookingSchema.index({ date: 1, slot: 1, bookingType: 1, status: 1 });

// Unique index per sport (safety net for same-sport duplicate prevention).
// Note: Cross-sport blocking is enforced at the application level via
// atomic transactions in crossSportValidation.ts because the slot field
// stores comma-separated values that can't be reliably deduplicated by
// a simple unique index alone.
TurfBookingSchema.index(
  { date: 1, slot: 1, sport: 1 },
  {
    partialFilterExpression: { status: { $in: ['confirmed'] } },
    unique: true,
    sparse: true,
  }
);

export default mongoose.models.TurfBooking ||
  mongoose.model<ITurfBooking>('TurfBooking', TurfBookingSchema);

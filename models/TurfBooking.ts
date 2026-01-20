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
  status: 'confirmed' | 'cancelled' | 'completed';
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
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double booking
TurfBookingSchema.index({ date: 1, slot: 1, sport: 1, status: 1 });

// Create a unique index for date, slot, and sport combination for confirmed bookings
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

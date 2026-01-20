import mongoose, { Document, Schema } from 'mongoose';

export interface ICouponUsage extends Document {
  couponCode: string; // The coupon code used
  email: string; // User's email
  mobile: string; // User's mobile number
  bookingId?: string; // Optional reference to the booking
  usedAt: Date;
}

const CouponUsageSchema = new Schema<ICouponUsage>(
  {
    couponCode: {
      type: String,
      required: [true, 'Coupon code is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    bookingId: {
      type: String,
      default: null,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster queries
CouponUsageSchema.index({ couponCode: 1, email: 1 });
CouponUsageSchema.index({ couponCode: 1, mobile: 1 });
CouponUsageSchema.index({ couponCode: 1, email: 1, mobile: 1 });

export default mongoose.models.CouponUsage ||
  mongoose.model<ICouponUsage>('CouponUsage', CouponUsageSchema);

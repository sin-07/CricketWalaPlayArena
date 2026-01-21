import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string; // Unique coupon code
  discountType: 'flat' | 'percent'; // Type of discount
  discountValue: number; // Discount amount or percentage
  applicableSlots: Array<{
    date: string; // YYYY-MM-DD
    slot: string; // e.g., "06:00-07:00"
  }>;
  sport: string[]; // ['Cricket', 'Football', 'Badminton'] - empty means all
  bookingType: 'match' | 'practice' | 'both'; // Applicable booking type
  assignedUsers: string[]; // Array of emails - empty means all users
  minAmount: number; // Minimum booking amount for coupon to apply
  expiryDate: Date;
  usageLimit: number; // Total usage limit (0 = unlimited)
  usedCount: number; // Current usage count
  perUserLimit: number; // Limit per user (0 = unlimited)
  isActive: boolean; // Admin can enable/disable
  showOnHomePage: boolean; // Show this offer on homepage marquee
  offerTitle: string; // Display title for homepage (e.g., "🎉 Special Weekend Offer!")
  createdBy: string; // Admin ID who created
  adminPhones: string[]; // Array of admin phone numbers who have access to manage this coupon
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Code must be at least 3 characters'],
      maxlength: [20, 'Code must not exceed 20 characters'],
      match: [/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'],
    },
    discountType: {
      type: String,
      enum: ['flat', 'percent'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be positive'],
    },
    applicableSlots: {
      type: [
        {
          date: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
          },
          slot: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    sport: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          const validSports = ['Cricket', 'Football', 'Badminton'];
          return v.every((sport) => validSports.includes(sport));
        },
        message: 'Invalid sport',
      },
    },
    bookingType: {
      type: String,
      enum: ['match', 'practice', 'both'],
      required: [true, 'Booking type is required'],
    },
    assignedUsers: {
      type: [String], // Store emails or userIds
      default: [],
    },
    minAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum amount must be non-negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: [0, 'Usage limit must be non-negative'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [0, 'Per user limit must be non-negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomePage: {
      type: Boolean,
      default: false,
    },
    offerTitle: {
      type: String,
      default: '',
      maxlength: [100, 'Offer title must not exceed 100 characters'],
    },
    createdBy: {
      type: String,
      required: [true, 'Creator admin ID is required'],
    },
    adminPhones: {
      type: [String],
      default: ['8340296635'],
      validate: {
        validator: function(v: string[]) {
          return v.every(phone => /^[0-9]{10}$/.test(phone));
        },
        message: 'Each phone number must be 10 digits',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (code index not needed - unique:true already creates it)
CouponSchema.index({ isActive: 1, expiryDate: 1 });
CouponSchema.index({ assignedUsers: 1 });
CouponSchema.index({ createdAt: -1 });

export default mongoose.models.Coupon ||
  mongoose.model<ICoupon>('Coupon', CouponSchema);

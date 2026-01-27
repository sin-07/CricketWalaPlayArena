import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReviewStatus = 'PENDING' | 'APPROVED';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  userEmail?: string;
  bookingId?: string;
  rating: number;
  reviewText: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    userPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    bookingId: {
      type: String,
      trim: true,
      sparse: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED'],
      default: 'PENDING',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ userPhone: 1, bookingId: 1 });

// Prevent duplicate reviews from same phone for same booking
ReviewSchema.index(
  { userPhone: 1, bookingId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { bookingId: { $exists: true, $ne: null } } 
  }
);

// Static method to get approved reviews
ReviewSchema.statics.getApprovedReviews = async function(limit = 10) {
  return this.find({ status: 'APPROVED' })
    .sort({ approvedAt: -1, createdAt: -1 })
    .limit(limit)
    .select('-userPhone -userEmail');
};

// Static method to check if user already reviewed a booking
ReviewSchema.statics.hasUserReviewedBooking = async function(
  userPhone: string,
  bookingId: string
): Promise<boolean> {
  const existingReview = await this.findOne({ userPhone, bookingId });
  return !!existingReview;
};

// Static method to check review rate limiting (max 3 reviews per day per phone)
ReviewSchema.statics.canUserSubmitReview = async function(
  userPhone: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const reviewCount = await this.countDocuments({
    userPhone,
    createdAt: { $gte: today },
  });
  
  return reviewCount < 3;
};

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

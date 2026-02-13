import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string; // YYYY-MM-DD format
  slot: string; // e.g., "06:00-07:00"
  isFrozen: boolean;
  frozenBy?: string; // Admin ID
  frozenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
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
    isFrozen: {
      type: Boolean,
      default: false,
      index: true,
    },
    frozenBy: {
      type: String,
      default: null,
    },
    frozenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one slot per date, sport, and booking type
SlotSchema.index(
  { date: 1, slot: 1, sport: 1, bookingType: 1 },
  { unique: true, sparse: true }
);

// Index for faster frozen slot queries
SlotSchema.index({ date: 1, bookingType: 1, sport: 1, isFrozen: 1 });

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);

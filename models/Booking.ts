import mongoose, { Schema, Model } from 'mongoose';

export interface IBooking {
  _id?: string;
  boxId: number;
  boxName: string;
  date: string;
  timeSlotId: number;
  timeSlotIds: number[];
  customerName: string;
  email: string;
  phone: string;
  pricePerHour: number;
  totalAmount: number;
  bookingRef: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    boxId: {
      type: Number,
      required: [true, 'Box ID is required'],
    },
    boxName: {
      type: String,
      required: [true, 'Box name is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    timeSlotId: {
      type: Number,
      required: [true, 'Time slot ID is required'],
    },
    timeSlotIds: {
      type: [Number],
      required: [true, 'Time slot IDs are required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    bookingRef: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
BookingSchema.index({ boxId: 1, date: 1, timeSlotId: 1 });
BookingSchema.index({ bookingRef: 1 });
BookingSchema.index({ email: 1 });
BookingSchema.index({ date: 1 });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

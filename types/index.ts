export interface CricketBox {
  id: number;
  name: string;
  capacity: number;
  pricePerHour: number;
  description: string;
}

export interface TimeSlot {
  id: number;
  time: string;
  label: string;
}

export interface Booking {
  _id?: string;
  boxId: number;
  boxName: string;
  date: string;
  timeSlotId: number;
  timeSlotIds?: number[];
  customerName: string;
  email: string;
  phone: string;
  pricePerHour: number;
  totalAmount: number;
  bookingRef: string;
  status?: 'active' | 'completed' | 'cancelled' | 'confirmed';
  paymentStatus?: 'pending' | 'success' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
}

export interface BookedSlotInfo {
  timeSlotId: number;
  isBooked: boolean;
}

export interface UserBookingHistory {
  bookings: Booking[];
  totalBookings: number;
}

export interface SlotAvailability {
  date: string;
  boxId: number;
  bookedSlots: number[];
  nextAvailableSlot: TimeSlot | null;
}

export interface CustomerData {
  customerName: string;
  email: string;
  phone: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

// TurfBooking interface matching the TurfBooking model
export interface TurfBooking {
  _id: string;
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string;
  slot: string;
  name: string;
  mobile: string;
  email: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  totalPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  advancePayment?: number;
  remainingPayment?: number;
  source?: 'online' | 'offline';
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CricketBox, CustomerData, Booking } from '@/types';
import { CRICKET_BOXES } from '@/utils/dummyData';
import DatePickerComponent from '@/components/DatePickerComponent';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import BookingHistoryComponent from '@/components/BookingHistoryComponent';
import PaymentModal from '@/components/PaymentModal';
import NotificationSystem, {
  Notification,
  NotificationType,
} from '@/components/NotificationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useBookings from '@/hooks/useBookings';
import { getMinDate, getMaxDate, generateBookingRef, calculateTotalPrice } from '@/utils/helpers';
import { Calendar, Clock, User, Mail, Phone, Check, MapPin, CheckCircle2, X } from 'lucide-react';

// Fixed Arena - Arena A
const FIXED_ARENA = CRICKET_BOXES[0];

export default function EnhancedBookingPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getMinDate());
  const [selectedBox, setSelectedBox] = useState<CricketBox>(FIXED_ARENA);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [bookingDetailsFromApi, setBookingDetailsFromApi] = useState<any>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const { bookings, addBooking, loading, refreshBookings } = useBookings();

  // Check if admin is logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, []);

  // Real-time updates every 30 seconds
  useEffect(() => {
    refreshBookings();
    const interval = setInterval(refreshBookings, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update booked slots when bookings change
  useEffect(() => {
    const slots: number[] = [];
    bookings
      .filter((b) => b.boxId === selectedBox.id && b.date === selectedDate && (b.status === 'active' || b.status === 'confirmed'))
      .forEach((b) => {
        // Add all slots from timeSlotIds array
        if (b.timeSlotIds && b.timeSlotIds.length > 0) {
          slots.push(...b.timeSlotIds);
        } else if (b.timeSlotId) {
          // Fallback to single timeSlotId for legacy bookings
          slots.push(b.timeSlotId);
        }
      });
    setBookedSlots(slots);
  }, [bookings, selectedBox, selectedDate]);

  // Show history when phone/email is entered
  useEffect(() => {
    if (phone.length === 10 || (email && email.includes('@'))) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  }, [phone, email]);

  const addNotification = (message: string, type: NotificationType) => {
    const notification: Notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSlotToggle = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSlots.length === 0) {
      addNotification('Please select at least one time slot', 'error');
      return;
    }

    if (!customerName || !phone) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      const totalAmount = calculateTotalPrice(selectedBox.pricePerHour, selectedSlots.length);
      const bookingRef = generateBookingRef();

      const booking: Booking = {
        boxId: selectedBox.id,
        boxName: selectedBox.name,
        date: selectedDate,
        timeSlotId: selectedSlots[0],
        timeSlotIds: selectedSlots,
        customerName,
        email: email || '',
        phone,
        pricePerHour: selectedBox.pricePerHour,
        totalAmount,
        bookingRef,
        createdAt: new Date().toISOString(),
        status: 'active',
        paymentStatus: 'pending',
      };

      // Create Razorpay order
      const response = await fetch('/api/bookings/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boxId: booking.boxId,
          boxName: booking.boxName,
          date: booking.date,
          timeSlotIds: booking.timeSlotIds,
          customerName: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          pricePerHour: booking.pricePerHour,
          totalAmount: booking.totalAmount,
          bookingRef: booking.bookingRef,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Show payment modal
      setCurrentBooking(booking);
      setOrderId(data.data.orderId);
      setPaymentAmount(data.data.amount);
      setBookingDetailsFromApi(data.data.bookingDetails);
      setShowPayment(true);
    } catch (error: any) {
      addNotification(
        error.message || 'Failed to initiate payment. Please try again.',
        'error'
      );
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    try {
      setShowPayment(false);
      
      // Show success popup immediately
      setShowSuccessPopup(true);
      
      // Refresh bookings to show updated booking with confirmed status
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshBookings();
      
      // Reset form
      setSelectedSlots([]);
      setCustomerName('');
      setEmail('');
      setPhone('');
      setCurrentBooking(null);
      setOrderId('');
      setBookingDetailsFromApi(null);
    } catch (error: any) {
      addNotification('Error finalizing booking. Please contact support.', 'error');
    }
  };

  const handlePaymentFailure = (error: string) => {
    setShowPayment(false);
    addNotification(`Payment failed: ${error}. Please try again.`, 'error');
    setCurrentBooking(null);
    setOrderId('');
  };

  return (
    <div className="min-h-screen bg-green-50">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Success Icon */}
              <div className="bg-green-500 py-8 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <div className="bg-white rounded-full p-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  Payment Successful!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-4"
                >
                  Your slot has been booked successfully!
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-50 rounded-lg p-4 mb-6"
                >
                  <p className="text-sm text-green-700">
                    📧 Confirmation details have been sent to your email and SMS.
                  </p>
                </motion.div>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && currentBooking && (
          <PaymentModal
            booking={currentBooking}
            orderId={orderId}
            amount={paymentAmount}
            bookingDetails={bookingDetailsFromApi}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onClose={() => {
              setShowPayment(false);
              setCurrentBooking(null);
              setOrderId('');
              setBookingDetailsFromApi(null);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-0 sm:px-4 py-4 sm:py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 sm:mb-12 px-4 sm:px-0"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 mb-4">
            Book Your Cricket Wala Play Arena Slot
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">Select your preferred date, arena slot, and time slots</p>
        </motion.div>

        {/* Admin Message or Booking Form */}
        {isAdmin ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center py-12"
          >
            <Card className="max-w-2xl w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                    <User className="text-white text-4xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">You are Admin</h2>
                  <p className="text-lg text-gray-700 mb-4 text-center">
                    Administrators cannot book slots through this page.
                  </p>
                  <p className="text-xl font-semibold text-blue-700 mb-6 text-center">
                    Please use the Admin Panel to create offline bookings.
                  </p>
                  <a
                    href="/admin"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
                  >
                    <User className="mr-2" />
                    Go to Admin Panel
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-8">
          {/* Left Column - Booking Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:col-span-2"
          >
            <Card className="rounded-none sm:rounded-lg lg:sticky lg:top-4 shadow-none sm:shadow-xl w-full border-x-0 sm:border-x">
              <CardHeader className="bg-green-500">
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Fixed Arena Display */}
                  <div>
                    <Label className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Arena
                    </Label>
                    <div className="w-full px-4 py-3 bg-green-50 border border-green-300 rounded-lg text-green-800 font-semibold mt-2">
                      {FIXED_ARENA.name} - ₹{FIXED_ARENA.pricePerHour}/hour
                    </div>
                  </div>

                  {/* Date Selection */}
                  <DatePickerComponent
                    selectedDate={selectedDate}
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      setSelectedSlots([]);
                    }}
                    minDate={getMinDate()}
                    maxDate={getMaxDate()}
                  />

                  {/* Customer Name */}
                  <div>
                    <Label htmlFor="name">
                      <User className="inline w-4 h-4 mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="mt-2"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Mobile Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      required
                      className="mt-2"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>

                  {/* Booking History */}
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <BookingHistoryComponent phone={phone} email={email} />
                    </motion.div>
                  )}

                  {/* Price Summary */}
                  {selectedSlots.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-100 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">
                          {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-300">
                        <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                        <span className="text-3xl font-bold text-primary-600">
                          ₹{calculateTotalPrice(selectedBox.pricePerHour, selectedSlots.length)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || selectedSlots.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Time Slots */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 mt-0 lg:mt-0"
          >
            <Card className="rounded-none sm:rounded-lg shadow-none sm:shadow-xl border-x-0 sm:border-x border-t-0 sm:border-t">
              <CardHeader className="bg-green-500">
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TimeSlotSelector
                  selectedDate={selectedDate}
                  selectedSlots={selectedSlots}
                  bookedSlots={bookedSlots}
                  onSlotToggle={handleSlotToggle}
                  isAdmin={false}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        )}
      </motion.div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CricketBox, CustomerData, Booking } from '@/types';
import { CRICKET_BOXES } from '@/utils/dummyData';
import DatePickerComponent from '@/components/DatePickerComponent';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import BookingHistoryComponent from '@/components/BookingHistoryComponent';
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
import { Calendar, Clock, User, Mail, Phone, Check } from 'lucide-react';

export default function EnhancedBookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getMinDate());
  const [selectedBox, setSelectedBox] = useState<CricketBox>(CRICKET_BOXES[0]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { bookings, addBooking, loading, refreshBookings } = useBookings();

  // Real-time updates every 30 seconds
  useEffect(() => {
    refreshBookings();
    const interval = setInterval(refreshBookings, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update booked slots when bookings change
  useEffect(() => {
    const slots = bookings
      .filter((b) => b.boxId === selectedBox.id && b.date === selectedDate && b.status === 'active')
      .map((b) => b.timeSlotId);
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
      const booking: Booking = {
        boxId: selectedBox.id,
        boxName: selectedBox.name,
        date: selectedDate,
        timeSlotId: selectedSlots[0],
        timeSlotIds: selectedSlots,
        customerName,
        email: email || 'noemail@provided.com',
        phone,
        pricePerHour: selectedBox.pricePerHour,
        totalAmount: calculateTotalPrice(selectedBox.pricePerHour, selectedSlots.length),
        bookingRef: generateBookingRef(),
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      await addBooking(booking);
      addNotification('Booking confirmed successfully! 🎉', 'success');
      
      // Send confirmation (API call would be here)
      // await sendConfirmation(booking);

      // Reset form
      setSelectedSlots([]);
      setCustomerName('');
      setEmail('');
      setPhone('');
      
      await refreshBookings();
    } catch (error: any) {
      addNotification(
        error.response?.data?.error || 'Failed to create booking. Please try again.',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <NotificationSystem notifications={notifications} onRemove={removeNotification} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            Book Your Cricket Box
          </h1>
          <p className="text-xl text-gray-600">Select your preferred date, box, and time slots</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-4 shadow-xl">
              <CardHeader className="bg-green-500">
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Box Selection */}
                  <div>
                    <Label>Select Cricket Box</Label>
                    <select
                      value={selectedBox.id}
                      onChange={(e) => {
                        const box = CRICKET_BOXES.find((b) => b.id === parseInt(e.target.value));
                        if (box) setSelectedBox(box);
                        setSelectedSlots([]);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mt-2"
                    >
                      {CRICKET_BOXES.map((box) => (
                        <option key={box.id} value={box.id}>
                          {box.name} - ₹{box.pricePerHour}/hour
                        </option>
                      ))}
                    </select>
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
                        Confirm Booking
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
            className="lg:col-span-2"
          >
            <Card className="shadow-xl">
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
      </motion.div>
    </div>
  );
}

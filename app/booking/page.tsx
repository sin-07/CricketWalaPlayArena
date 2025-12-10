'use client';

import React, { useState, useEffect } from 'react';
import { CricketBox, CustomerData, Booking } from '@/types';
import { CRICKET_BOXES } from '@/utils/dummyData';
import SlotPicker from '@/components/SlotPicker';
import BookingForm from '@/components/BookingForm';
import BookingSummary from '@/components/BookingSummary';
import NotificationBanner from '@/components/NotificationBanner';
import SlotStatus from '@/components/SlotStatus';
import useBookings from '@/hooks/useBookings';
import useNotifications from '@/hooks/useNotifications';
import { getMinDate, generateBookingRef, calculateTotalPrice } from '@/utils/helpers';

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getMinDate());
  const [selectedBox, setSelectedBox] = useState<CricketBox | null>(CRICKET_BOXES[0]); // Auto-select first box
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [realTimeBookedSlots, setRealTimeBookedSlots] = useState<number[]>([]);

  const { bookings, addBooking, loading, refreshBookings } = useBookings();
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Auto-refresh bookings for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBookings();
    }, 8000); // Refresh every 8 seconds

    return () => clearInterval(interval);
  }, [refreshBookings]);

  const getUnavailableSlots = (): string[] => {
    if (!selectedBox) return [];
    
    // Combine both bookings from API and real-time slot updates
    const apiBookedSlots = bookings
      .filter((booking) => 
        booking.boxId === selectedBox.id && 
        booking.date === selectedDate
      )
      .map((booking) => booking.timeSlotId);

    // Merge with real-time updates and remove duplicates
    const allBookedSlots = [...new Set([...apiBookedSlots, ...realTimeBookedSlots])];
    
    return allBookedSlots.map(slotId => `slot-${slotId}`);
  };

  const handleSlotsUpdate = (bookedSlots: number[]) => {
    setRealTimeBookedSlots(bookedSlots);
    
    // Clear any selected slots that are now booked
    const bookedSlotIds = bookedSlots.map(id => `slot-${id}`);
    const stillAvailableSlots = selectedSlots.filter(slot => !bookedSlotIds.includes(slot));
    
    if (stillAvailableSlots.length !== selectedSlots.length) {
      setSelectedSlots(stillAvailableSlots);
      addNotification('Some selected slots were just booked by another user. Please select again.', 'warning');
    }
  };

  const getBookedSlotsDetails = () => {
    if (!selectedBox) return [];
    
    return bookings
      .filter((booking) => 
        booking.boxId === selectedBox.id && 
        booking.date === selectedDate
      )
      .map((booking) => ({
        timeSlotId: booking.timeSlotId,
        customerName: booking.customerName,
        email: booking.email,
        phone: booking.phone,
        bookingRef: booking.bookingRef,
        timeSlotIds: booking.timeSlotIds || [booking.timeSlotId]
      }));
  };

  const handleSlotToggle = (slotId: string): void => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter((id) => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleDateChange = (date: string): void => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const handleBoxChange = (box: CricketBox | null): void => {
    setSelectedBox(box);
    setSelectedSlots([]);
  };

  const handleBookingSubmit = async (customerData: CustomerData): Promise<void> => {
    if (!selectedBox) return;

    try {
      const slotIds = selectedSlots.map(slot => parseInt(slot.replace('slot-', '')));

      const booking: Booking = {
        boxId: selectedBox.id,
        boxName: selectedBox.name,
        date: selectedDate,
        timeSlotId: slotIds[0],
        timeSlotIds: slotIds,
        customerName: customerData.customerName,
        email: customerData.email,
        phone: customerData.phone,
        pricePerHour: selectedBox.pricePerHour,
        totalAmount: calculateTotalPrice(selectedBox.pricePerHour, selectedSlots.length),
        bookingRef: generateBookingRef(),
        createdAt: new Date().toISOString(),
      };

      // Store the current user's email for showing their bookings
      setCurrentUserEmail(customerData.email);

      await addBooking(booking);
      addNotification('Booking confirmed successfully!', 'success');
      setCurrentBooking(booking);
      setShowSummary(true);
      setSelectedSlots([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create booking. Please try again.';
      addNotification(errorMessage, 'error');
      
      if (error.response?.data?.bookedSlots) {
        await refreshBookings();
      }
    }
  };

  const handleCloseSummary = (): void => {
    setShowSummary(false);
    setCurrentBooking(null);
  };

  return (
    <>
      <NotificationBanner notifications={notifications} onRemove={removeNotification} />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Your Cricket Box</h1>
            <p className="text-gray-600">Select your preferred date, box, and time slots</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : (
                  <BookingForm
                    onSubmit={handleBookingSubmit}
                    selectedDate={selectedDate}
                    selectedBox={selectedBox}
                    selectedSlots={selectedSlots}
                    onDateChange={handleDateChange}
                    onBoxChange={handleBoxChange}
                  />
                )}
              </div>
            </div>

            {/* Right Column - Slot Picker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Slot Status Component */}
              {selectedBox && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <SlotStatus 
                    boxId={selectedBox.id} 
                    date={selectedDate}
                    onSlotsUpdate={handleSlotsUpdate}
                  />
                </div>
              )}

              {/* Slot Picker */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <SlotPicker
                  selectedDate={selectedDate}
                  selectedBox={selectedBox}
                  selectedSlots={selectedSlots}
                  onSlotToggle={handleSlotToggle}
                  unavailableSlots={getUnavailableSlots()}
                  bookedSlotsDetails={getBookedSlotsDetails()}
                  currentUserEmail={currentUserEmail}
                />
              </div>
            </div>
          </div>
        </div>

        {showSummary && (
          <BookingSummary booking={currentBooking} onClose={handleCloseSummary} />
        )}
      </div>
    </>
  );
}

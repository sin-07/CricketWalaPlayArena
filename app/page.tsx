'use client';

import React, { useState } from 'react';
import { CricketBox, CustomerData, Booking } from '@/types';
import { CRICKET_BOXES } from '@/utils/dummyData';
import BookingForm from '@/components/BookingForm';
import SlotPicker from '@/components/SlotPicker';
import BookingSummary from '@/components/BookingSummary';
import NotificationBanner from '@/components/NotificationBanner';
import Gallery from '@/components/Gallery';
import useBookings from '@/hooks/useBookings';
import useNotifications from '@/hooks/useNotifications';
import {
  getMinDate,
  generateBookingRef,
  calculateTotalPrice,
} from '@/utils/helpers';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(getMinDate());
  const [selectedBox, setSelectedBox] = useState<CricketBox | null>(CRICKET_BOXES[0]); // Auto-select first box
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const { bookings, addBooking, loading, refreshBookings } = useBookings();
  const { notifications, addNotification, removeNotification } = useNotifications();

  const getUnavailableSlots = (): string[] => {
    if (!selectedBox) return [];

    return bookings
      .filter(
        (booking) =>
          booking.boxId === selectedBox.id && booking.date === selectedDate
      )
      .map((booking) => `slot-${booking.timeSlotId}`);
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
        totalAmount: calculateTotalPrice(
          selectedBox.pricePerHour,
          selectedSlots.length
        ),
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
      
      // If specific slots are booked, update the UI
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Professional Hero Section */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="relative container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="text-2xl">🏏</span>
                <span className="text-sm font-semibold tracking-wide">
                  PREMIUM CRICKET FACILITIES
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                Book Your Perfect
                <span className="block text-primary-200">
                  Cricket Practice Session
                </span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                State-of-the-art Cricket Wala Play Arena slots with professional equipment.
                Available 24/7 for your convenience.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold mb-1">18</div>
                  <div className="text-xs text-primary-100 uppercase tracking-wide">
                    Time Slots
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="text-2xl font-bold mb-1">4</div>
                  <div className="text-xs text-primary-100 uppercase tracking-wide">
                    Premium Boxes
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold mb-1">₹1.5K</div>
                  <div className="text-xs text-primary-100 uppercase tracking-wide">
                    Starting From
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl mb-2">🕐</div>
                  <div className="text-2xl font-bold mb-1">24/7</div>
                  <div className="text-xs text-primary-100 uppercase tracking-wide">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Booking Section */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Reserve Your Slot Now
              </h2>
              <p className="text-gray-600 text-lg">
                Choose your preferred date, box, and time slots in 3 easy steps
              </p>
            </div>

            {/* Booking Grid */}
            <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
              {/* Booking Form - Left Sidebar */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-4">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>📝</span> Booking Details
                    </h3>
                  </div>
                  <div className="p-6">
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
              </div>

              {/* Right Content Area */}
              <div className="lg:col-span-8">
                {/* Time Slots */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>⏰</span> Choose Time Slots
                    </h3>
                  </div>
                  <div className="p-6">
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
          </div>
        </div>

        {/* Features Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                Why Choose Us?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the best cricket practice facilities with modern
                amenities
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                  Instant Booking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Book your slot in seconds with real-time availability updates
                  and instant confirmation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="text-5xl mb-4">🏏</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                  Professional Setup
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  State-of-the-art Cricket Wala Play Arena slots with bowling machines and premium
                  equipment.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                  Affordable Rates
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Competitive pricing starting from ₹1,500/hour with no hidden
                  charges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                Our Cricket Facilities
              </h2>
              <p className="text-gray-600">
                Explore our state-of-the-art Cricket Wala Play Arena slots and facilities
              </p>
            </div>

            <Gallery />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                How It Works
              </h2>
              <p className="text-gray-600">Book your session in 3 simple steps</p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                      1
                    </div>
                    <h3 className="text-xl font-bold mb-3">Select Date & Box</h3>
                    <p className="text-primary-100">
                      Choose your preferred date, time slots, and Cricket Wala Play Arena slot from
                      available options
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-4xl text-primary-600">→</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                      2
                    </div>
                    <h3 className="text-xl font-bold mb-3">Enter Details</h3>
                    <p className="text-primary-100">
                      Fill in your contact information and review your booking
                      details
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-4xl text-primary-600">→</div>
                  </div>
                </div>

                <div>
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-white text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                      3
                    </div>
                    <h3 className="text-xl font-bold mb-3">Start Playing!</h3>
                    <p className="text-primary-100">
                      Get instant confirmation and arrive at the venue to enjoy
                      your session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Summary Modal */}
        {showSummary && (
          <BookingSummary booking={currentBooking} onClose={handleCloseSummary} />
        )}
      </div>
    </>
  );
}

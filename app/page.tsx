'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CricketBox, CustomerData, Booking } from '@/types';
import { CRICKET_BOXES } from '@/utils/dummyData';
import BookingForm from '@/components/BookingForm';
import SlotPicker from '@/components/SlotPicker';
import BookingSummary from '@/components/BookingSummary';
import NotificationBanner from '@/components/NotificationBanner';
import Gallery from '@/components/Gallery';
import PaymentModal from '@/components/PaymentModal';
import useBookings from '@/hooks/useBookings';
import useNotifications from '@/hooks/useNotifications';
import { FaBolt, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getMinDate,
  generateBookingRef,
  calculateTotalPrice,
} from '@/utils/helpers';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(getMinDate());
  const [selectedBox, setSelectedBox] = useState<CricketBox | null>(CRICKET_BOXES[0]); // Auto-select first box
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  const { bookings, addBooking, loading, refreshBookings } = useBookings();
  const { notifications, addNotification, removeNotification } = useNotifications();

  // Check if admin is logged in via API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.authenticated);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const getUnavailableSlots = (): string[] => {
    if (!selectedBox) return [];

    const unavailable: string[] = [];
    bookings
      .filter(
        (booking) =>
          booking.boxId === selectedBox.id && booking.date === selectedDate
      )
      .forEach((booking) => {
        // Add all slots from timeSlotIds array
        if (booking.timeSlotIds && booking.timeSlotIds.length > 0) {
          booking.timeSlotIds.forEach(slotId => {
            unavailable.push(`slot-${slotId}`);
          });
        } else if (booking.timeSlotId) {
          // Fallback for legacy single slot bookings
          unavailable.push(`slot-${booking.timeSlotId}`);
        }
      });
    return unavailable;
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
      const totalAmount = calculateTotalPrice(selectedBox.pricePerHour, selectedSlots.length);
      const bookingRef = generateBookingRef();

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
        totalAmount,
        bookingRef,
        createdAt: new Date().toISOString(),
        status: 'active',
        paymentStatus: 'pending',
      };

      // Store the current user's email for showing their bookings
      setCurrentUserEmail(customerData.email);

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
      setShowPayment(true);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initiate payment. Please try again.';
      addNotification(errorMessage, 'error');
      
      // If specific slots are booked, update the UI
      await refreshBookings();
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    try {
      setShowPayment(false);
      addNotification('Payment successful! Finalizing your booking...', 'info');
      
      // Refresh bookings to show updated booking with confirmed status
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshBookings();

      addNotification('Booking confirmed successfully! Check your email and SMS for confirmation details.', 'success');
      
      // Show booking summary
      setShowSummary(true);
      
      // Reset form
      setSelectedSlots([]);
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

  const handleCloseSummary = (): void => {
    setShowSummary(false);
    setCurrentBooking(null);
  };

  return (
    <>
      <NotificationBanner notifications={notifications} onRemove={removeNotification} />
      
      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && currentBooking && (
          <PaymentModal
            booking={currentBooking}
            orderId={orderId}
            amount={paymentAmount}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onClose={() => {
              setShowPayment(false);
              setCurrentBooking(null);
              setOrderId('');
            }}
          />
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Professional Hero Section */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-700"></div>
          </div>

          <div className="relative container mx-auto px-0 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <GiCricketBat className="text-2xl" />
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
            </div>
          </div>
        </div>

        {/* Main Booking Section */}
        <div className="container mx-auto px-0 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Show loading while checking auth, then Admin Message or Booking Form */}
            {authLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : isAdmin ? (
              <div className="text-center py-12">
                <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                        <GiCricketBat className="text-white text-4xl" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">Admin Access</h2>
                      <p className="text-lg text-gray-700 mb-4">
                        You are logged in as an administrator.
                      </p>
                      <p className="text-xl font-semibold text-blue-700 mb-6">
                        Please use the Admin Panel to create offline bookings.
                      </p>
                      <a
                        href="/admin"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center"
                      >
                        <GiCricketBat className="mr-2" />
                        Go to Admin Panel
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Section Header */}
                <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Reserve Your Slot Now
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Choose your preferred date, box, and time slots in 3 easy steps
                  </p>
                </div>

                {/* Booking Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-8">
                  {/* Booking Form - Left Column */}
                  <div className="w-full lg:col-span-2">
                    <Card className="rounded-none sm:rounded-lg lg:sticky lg:top-4 shadow-none sm:shadow-xl w-full border-x-0 sm:border-x">
                      <CardHeader className="bg-green-500">
                        <CardTitle className="text-white flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Booking Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <BookingForm
                          onSubmit={handleBookingSubmit}
                          selectedDate={selectedDate}
                          selectedBox={selectedBox}
                          selectedSlots={selectedSlots}
                          onDateChange={handleDateChange}
                          onBoxChange={handleBoxChange}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Content Area - Time Slots */}
                  <div className="lg:col-span-3 mt-0 lg:mt-0">
                    <Card className="rounded-none sm:rounded-lg shadow-none sm:shadow-xl border-x-0 sm:border-x border-t-0 sm:border-t">
                      <CardHeader className="bg-green-500">
                        <CardTitle className="text-white flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Available Time Slots
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <SlotPicker
                          selectedDate={selectedDate}
                          selectedBox={selectedBox}
                          selectedSlots={selectedSlots}
                          onSlotToggle={handleSlotToggle}
                          unavailableSlots={getUnavailableSlots()}
                          bookedSlotsDetails={getBookedSlotsDetails()}
                          currentUserEmail={currentUserEmail}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section className="py-8 sm:py-12 md:py-20 bg-white">
          <div className="container mx-auto px-0 sm:px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                Why Choose Us?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the best cricket practice facilities with modern
                amenities
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-primary-50 to-white p-4 sm:p-6 md:p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-b sm:border-0">
                <div className="text-5xl mb-4"><FaBolt className="text-yellow-500" /></div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                  Instant Booking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Book your slot in seconds with real-time availability updates
                  and instant confirmation.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white p-4 sm:p-6 md:p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-b sm:border-0">
                <div className="text-5xl mb-4"><GiCricketBat className="text-green-600" /></div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
                  Professional Setup
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  State-of-the-art Cricket Wala Play Arena slots with bowling machines and premium
                  equipment.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white p-4 sm:p-6 md:p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1 border-b sm:border-0">
                <div className="text-5xl mb-4"><FaMoneyBillWave className="text-green-600" /></div>
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
        <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-0 sm:px-4">
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
        <section className="py-8 sm:py-12 md:py-20 bg-white">
          <div className="container mx-auto px-0 sm:px-4">
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

'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SportSelector from '@/components/SportSelector';
import TurfDatePicker from '@/components/TurfDatePicker';
import SlotSelector from '@/components/SlotSelectorComponent';
import {
  validateBookingForm,
  normalizeMobileNumber,
  getMinDate,
  type BookingFormData,
} from '@/lib/bookingValidation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateFinalPrice, getDiscountInfo } from '@/lib/pricingUtils';

interface TurfBookingFormProps {
  bookingType: 'match' | 'practice';
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: Array<{ field: string; message: string }>;
}

export default function TurfBookingForm({
  bookingType,
}: TurfBookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    bookingType,
    sport: '',
    date: getMinDate(),
    slot: '',
    name: '',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingPrice, setBookingPrice] = useState<{ basePrice: number; finalPrice: number; discountPercentage: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => setServerError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly.slice(0, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSportChange = (sport: string) => {
    setFormData((prev) => ({
      ...prev,
      sport,
      slot: '', // Reset slot when sport changes
    }));
    if (errors.sport) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sport;
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      date,
      slot: '', // Reset slot when date changes
    }));
    if (errors.date) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
  };

  const handleSlotChange = (slot: string) => {
    setFormData((prev) => ({
      ...prev,
      slot,
    }));
    if (errors.slot) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.slot;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Validate form
    const validationErrors = validateBookingForm({
      ...formData,
      mobile: normalizeMobileNumber(formData.mobile),
    });

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/turf-bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          mobile: normalizeMobileNumber(formData.mobile),
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // Handle validation errors from server
        if (data.errors) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((err) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
        } else {
          setServerError(data.message || 'Failed to create booking');
        }
        return;
      }

      // Success
      setSuccessMessage('✅ Booking confirmed! Check your email for details.');
      setBookingRef(data.data?.bookingRef || 'N/A');
      setBookingPrice({
        basePrice: data.data?.basePrice || 0,
        finalPrice: data.data?.finalPrice || 0,
        discountPercentage: data.data?.discountPercentage || 0,
      });
      setShowSuccessModal(true);
      setFormData({
        bookingType,
        sport: '',
        date: getMinDate(),
        slot: '',
        name: '',
        mobile: '',
        email: '',
      });
      setErrors({});

      // Auto close modal after 4 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 4000);
    } catch (error: any) {
      console.error('Booking error:', error);
      setServerError(
        error.message || 'An error occurred while creating your booking'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Modal Popup */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 py-8 flex justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-2xl"></div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  Booking Confirmed!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-lg mb-6"
                >
                  Your turf booking has been confirmed successfully.
                </motion.p>

                {/* Booking Details */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200"
                >
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Booking Type</p>
                      <p className="text-lg text-gray-900 capitalize font-bold">
                        {formData.bookingType === 'match' ? '🏏 Match' : '🎯 Practice'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Sport</p>
                      <p className="text-lg text-gray-900 font-bold">{formData.sport}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Date & Time</p>
                      <p className="text-lg text-gray-900 font-bold">{formData.date} • {formData.slot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Booking Reference</p>
                      <p className="text-lg text-green-600 font-mono font-bold">{bookingRef}</p>
                    </div>
                    
                    {/* Pricing Section */}
                    {bookingPrice && (
                      <>
                        <div className="border-t border-green-200 pt-3 mt-3">
                          {bookingPrice.discountPercentage > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 font-semibold">Original Price</p>
                              <p className="text-lg text-gray-900 line-through">₹{bookingPrice.basePrice}</p>
                              <p className="text-sm text-green-600 font-bold mt-2">
                                🎉 Discount Applied: {bookingPrice.discountPercentage}%
                              </p>
                              <p className="text-2xl font-bold text-green-700 mt-1">
                                ₹{bookingPrice.finalPrice}
                              </p>
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                💰 Savings: ₹{(bookingPrice.basePrice - bookingPrice.finalPrice).toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-gray-600 font-semibold">Price</p>
                              <p className="text-2xl font-bold text-green-700">
                                ₹{bookingPrice.finalPrice}
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200"
                >
                  <p className="text-sm text-blue-700">
                    📧 A confirmation email has been sent to <strong>{formData.email}</strong>
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Server Error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{serverError}</p>
          </div>
        )}

        {/* Sport Selector */}
        <div className={errors.sport ? 'border-l-4 border-red-500 pl-3' : ''}>
          <SportSelector
            bookingType={bookingType}
            selectedSport={formData.sport}
            onSportChange={handleSportChange}
          />
          {errors.sport && (
            <p className="text-red-500 text-sm mt-1">{errors.sport}</p>
          )}
        </div>

        {/* Date Picker */}
        <div className={errors.date ? 'border-l-4 border-red-500 pl-3' : ''}>
          <TurfDatePicker
            selectedDate={formData.date}
            onDateChange={handleDateChange}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Slot Selector */}
        <div className={errors.slot ? 'border-l-4 border-red-500 pl-3' : ''}>
          <SlotSelector
            date={formData.date}
            sport={formData.sport}
            bookingType={formData.bookingType}
            selectedSlot={formData.slot}
            onSlotChange={handleSlotChange}
            loading={loading}
          />
          {errors.slot && (
            <p className="text-red-500 text-sm mt-1">{errors.slot}</p>
          )}
        </div>

        {/* Pricing Display */}
        {formData.date && formData.bookingType && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">{getDiscountInfo(formData.bookingType, formData.date)}</p>
              {(() => {
                const pricing = calculateFinalPrice(formData.bookingType, formData.date);
                return (
                  <div className="flex items-end justify-between">
                    <div>
                      {pricing.discountPercentage > 0 && (
                        <p className="text-sm text-gray-600">
                          Original: <span className="line-through">₹{pricing.basePrice}</span>
                        </p>
                      )}
                      <p className="text-lg font-bold text-green-700">
                        Final Price: ₹{pricing.finalPrice.toFixed(2)}
                      </p>
                      {pricing.discountPercentage > 0 && (
                        <p className="text-xs text-green-600 font-semibold">
                          💰 You save: ₹{pricing.discountAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    {pricing.discountPercentage > 0 && (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{pricing.discountPercentage}%
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Full Name */}
        <div className={errors.name ? 'border-l-4 border-red-500 pl-3' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className={errors.mobile ? 'border-l-4 border-red-500 pl-3' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div className={errors.email ? 'border-l-4 border-red-500 pl-3' : ''}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            'Book Now'
          )}
        </button>
      </form>
    </>
  );
}

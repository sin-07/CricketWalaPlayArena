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
import { CheckCircle2, AlertCircle, Tag, X, Trophy, Target, Lightbulb } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';
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
  const [bookingPrice, setBookingPrice] = useState<{ basePrice: number; finalPrice: number; bookingCharge: number; totalPrice: number; discountPercentage: number; couponDiscount?: number; couponCode?: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: 'flat' | 'percent';
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

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
    // Reset coupon when sport changes
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode('');
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
    // Reset coupon when date changes
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode('');
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
    // Reset coupon when slot changes
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode('');
    if (errors.slot) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.slot;
        return newErrors;
      });
    }
  };

  // Validate and apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!formData.sport || !formData.date || !formData.slot || !formData.email || !formData.mobile) {
      setCouponError('Please fill in sport, date, slot, email, and mobile first');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      // Calculate price after weekly discount first
      const pricing = calculateFinalPrice(formData.bookingType, formData.date);
      const priceAfterWeeklyDiscount = pricing.finalPrice;

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          bookingType: formData.bookingType,
          sport: formData.sport,
          date: formData.date,
          slot: formData.slot,
          basePrice: priceAfterWeeklyDiscount, // Use price after weekly discount
          userEmail: formData.email,
          userMobile: formData.mobile, // Include mobile for duplicate check
        }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: data.discount,
          discountType: data.couponData?.discountType || 'flat',
          discountValue: data.couponData?.discountValue || 0,
        });
        setCouponError(null);
      } else {
        setCouponError(data.message || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Calculate total price with all discounts
  const calculateTotalWithCoupon = () => {
    if (!formData.date || !formData.bookingType) return null;
    
    const pricing = calculateFinalPrice(formData.bookingType, formData.date);
    let finalPriceAfterAllDiscounts = pricing.finalPrice;
    
    if (appliedCoupon) {
      finalPriceAfterAllDiscounts = Math.max(0, pricing.finalPrice - appliedCoupon.discount);
    }
    
    return {
      basePrice: pricing.basePrice,
      weeklyDiscount: pricing.discountAmount,
      weeklyDiscountPercentage: pricing.discountPercentage,
      priceAfterWeeklyDiscount: pricing.finalPrice,
      couponDiscount: appliedCoupon?.discount || 0,
      finalPrice: finalPriceAfterAllDiscounts,
      bookingCharge: pricing.bookingCharge,
      totalPrice: finalPriceAfterAllDiscounts + pricing.bookingCharge,
    };
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
          couponCode: appliedCoupon?.code || null, // Include applied coupon
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
      setSuccessMessage('Booking confirmed! Check your email for details.');
      setBookingRef(data.data?.bookingRef || 'N/A');
      setBookingPrice({
        basePrice: data.data?.basePrice || 0,
        finalPrice: data.data?.finalPrice || 0,
        bookingCharge: data.data?.bookingCharge || 200,
        totalPrice: data.data?.totalPrice || 0,
        discountPercentage: data.data?.discountPercentage || 0,
        couponDiscount: data.data?.couponDiscount || 0,
        couponCode: data.data?.couponCode || undefined,
      });
      setShowSuccessModal(true);
      // Reset form including coupon
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
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError(null);

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green Header */}
              <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 py-6 sm:py-8 flex justify-center relative overflow-hidden flex-shrink-0">
                {/* Animated Background Circles */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"
                />
                
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="relative"
                >
                  <div className="bg-white rounded-full p-3 sm:p-4 shadow-xl">
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
                    </motion.div>
                  </div>
                  {/* Celebration Particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                        y: [0, -20 - i * 8],
                      }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i],
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 text-center"
                >
                  Booking Confirmed!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-5 text-center"
                >
                  Your turf booking has been confirmed successfully.
                </motion.p>

                {/* Booking Details Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 border border-green-200 shadow-sm"
                >
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-green-200">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Booking Type</p>
                      <p className="text-sm sm:text-base text-gray-900 capitalize font-bold bg-green-100 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                        {formData.bookingType === 'match' ? <Trophy className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                        {formData.bookingType === 'match' ? 'Match' : 'Practice'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Sport</p>
                      <p className="text-sm sm:text-base text-gray-900 font-bold">{formData.sport || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Date & Time</p>
                      <p className="text-sm sm:text-base text-gray-900 font-bold">{formData.date} • {formData.slot || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-200">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Booking Reference</p>
                      <p className="text-sm sm:text-base text-green-600 font-mono font-bold">{bookingRef}</p>
                    </div>
                    
                    {/* Pricing Section */}
                    {bookingPrice && (
                      <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs sm:text-sm text-gray-600">Original Price</p>
                          <p className={`text-sm sm:text-base font-semibold ${bookingPrice.discountPercentage > 0 ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            ₹{bookingPrice.basePrice}
                          </p>
                        </div>
                        
                        {bookingPrice.discountPercentage > 0 && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex justify-between items-center bg-green-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
                          >
                            <p className="text-xs sm:text-sm text-green-700 font-medium">
                              Weekly Offer ({bookingPrice.discountPercentage}%)
                            </p>
                            <p className="text-sm sm:text-base font-bold text-green-700">
                              -₹{(bookingPrice.basePrice - bookingPrice.finalPrice - (bookingPrice.couponDiscount || 0)).toFixed(0)}
                            </p>
                          </motion.div>
                        )}
                        
                        {/* Coupon Discount */}
                        {bookingPrice.couponDiscount && bookingPrice.couponDiscount > 0 && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex justify-between items-center bg-purple-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
                          >
                            <p className="text-xs sm:text-sm text-purple-700 font-medium flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Coupon {bookingPrice.couponCode && `(${bookingPrice.couponCode})`}
                            </p>
                            <p className="text-sm sm:text-base font-bold text-purple-700">
                              -₹{bookingPrice.couponDiscount}
                            </p>
                          </motion.div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <p className="text-xs sm:text-sm text-gray-600">Discounted Price</p>
                          <p className="text-base sm:text-lg font-bold text-green-600">₹{bookingPrice.finalPrice}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-xs sm:text-sm text-gray-600">Booking Charge</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">₹{bookingPrice.bookingCharge}</p>
                        </div>
                        
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mt-2"
                        >
                          <p className="text-sm sm:text-base font-bold">Total Amount</p>
                          <p className="text-lg sm:text-2xl font-bold">₹{bookingPrice.totalPrice}</p>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Email Notification */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 border border-blue-200 flex items-start gap-2 sm:gap-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Confirmation email sent to <strong className="break-all">{formData.email || 'your email'}</strong>
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Server Error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm sm:text-base">{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sport Selector */}
        <div
          className={`transition-all duration-200 ${errors.sport ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <SportSelector
            bookingType={bookingType}
            selectedSport={formData.sport}
            onSportChange={handleSportChange}
          />
          <AnimatePresence>
            {errors.sport && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.sport}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Date Picker */}
        <div
          className={`transition-all duration-200 ${errors.date ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <TurfDatePicker
            selectedDate={formData.date}
            onDateChange={handleDateChange}
          />
          <AnimatePresence>
            {errors.date && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.date}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Slot Selector */}
        <div
          className={`transition-all duration-200 ${errors.slot ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <SlotSelector
            date={formData.date}
            sport={formData.sport}
            bookingType={formData.bookingType}
            selectedSlot={formData.slot}
            onSlotChange={handleSlotChange}
            loading={loading}
          />
          <AnimatePresence>
            {errors.slot && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.slot}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Pricing Display - Only show after date is selected */}
        <AnimatePresence>
          {formData.date && formData.bookingType && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden"
            >
              {/* Weekly Discount Info */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">{getDiscountInfo(formData.bookingType, formData.date)}</p>
                {(() => {
                  const totalPricing = calculateTotalWithCoupon();
                  if (!totalPricing) return null;
                  
                  return (
                    <div className="space-y-2">
                      {/* Base Price */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Original Price:</span>
                        <span className={totalPricing.weeklyDiscountPercentage > 0 ? 'line-through text-gray-400' : 'font-semibold'}>
                          ₹{totalPricing.basePrice}
                        </span>
                      </div>
                      
                      {/* Weekly Discount */}
                      {totalPricing.weeklyDiscountPercentage > 0 && (
                        <div className="flex justify-between items-center text-sm bg-green-100 px-3 py-1.5 rounded-lg">
                          <span className="text-green-700">Weekly Discount ({totalPricing.weeklyDiscountPercentage}%):</span>
                          <span className="font-semibold text-green-700">-₹{totalPricing.weeklyDiscount.toFixed(0)}</span>
                        </div>
                      )}
                      
                      {/* Price after weekly discount */}
                      {totalPricing.weeklyDiscountPercentage > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">After Weekly Offer:</span>
                          <span className="font-semibold">₹{totalPricing.priceAfterWeeklyDiscount.toFixed(0)}</span>
                        </div>
                      )}
                      
                      {/* Coupon Discount (if applied) */}
                      {appliedCoupon && totalPricing.couponDiscount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-between items-center text-sm bg-purple-100 px-3 py-1.5 rounded-lg"
                        >
                          <span className="text-purple-700 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Coupon ({appliedCoupon.code}):
                          </span>
                          <span className="font-semibold text-purple-700">-₹{totalPricing.couponDiscount.toFixed(0)}</span>
                        </motion.div>
                      )}
                      
                      {/* Final Price */}
                      <div className="flex justify-between items-center pt-2 border-t border-green-200">
                        <span className="text-lg font-bold text-green-700">Final Price:</span>
                        <span className="text-lg font-bold text-green-700">₹{totalPricing.finalPrice.toFixed(0)}</span>
                      </div>
                      
                      {/* Total Savings */}
                      {(totalPricing.weeklyDiscount > 0 || totalPricing.couponDiscount > 0) && (
                        <p className="text-xs text-green-600 font-semibold text-right">
                          Total Savings: ₹{(totalPricing.weeklyDiscount + totalPricing.couponDiscount).toFixed(0)}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Name */}
        <div
          className={`transition-all duration-200 ${errors.name ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 text-sm sm:text-base placeholder:text-gray-400"
          />
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Number */}
        <div
          className={`transition-all duration-200 ${errors.mobile ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">+91</span>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 text-sm sm:text-base placeholder:text-gray-400"
            />
          </div>
          <AnimatePresence>
            {errors.mobile && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.mobile}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
        <div
          className={`transition-all duration-200 ${errors.email ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/80 text-sm sm:text-base placeholder:text-gray-400"
          />
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-500 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Coupon Input Section - Show after email and mobile are filled */}
        {formData.email && formData.mobile && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4 text-purple-600" />
              Have a Coupon Code?
            </label>
            
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-purple-100 border border-purple-300 rounded-xl px-4 py-3 mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-bold text-purple-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-purple-600">
                      {appliedCoupon.discountType === 'percent' 
                        ? `${appliedCoupon.discountValue}% off` 
                        : `₹${appliedCoupon.discountValue} off`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1.5 hover:bg-purple-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-purple-600" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 bg-white text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim() || !formData.sport || !formData.slot || !formData.date}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors text-sm flex items-center gap-1"
                >
                  {couponLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            )}
            
            {/* Coupon Error */}
            <AnimatePresence>
              {couponError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-500 text-sm mt-2 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {couponError}
                </motion.p>
              )}
            </AnimatePresence>
            
            {/* Message if fields not filled */}
            {(!formData.sport || !formData.slot || !formData.date) && !appliedCoupon && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Select sport, date & slot first to apply coupon
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:shadow-none text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <GiCricketBat className="w-5 h-5" />
                {formData.date && formData.bookingType ? (
                  <span>Pay ₹{calculateTotalWithCoupon()?.finalPrice.toFixed(0) || 0} & Book Now</span>
                ) : (
                  <span>Book Now</span>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    slot: [], // Changed to array for multiple slots
    name: '',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [bookingPrice, setBookingPrice] = useState<{ basePrice: number; finalPrice: number; bookingCharge: number; totalPrice: number; discountPercentage: number; couponDiscount?: number; couponCode?: string } | null>(null);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<{ sport: string; date: string; slot: string; bookingType: string; email: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  // Freeze background scrolling when modal is open
  React.useEffect(() => {
    if (showSuccessModal || showConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSuccessModal, showConfirmModal]);

  // Freeze background scrolling when modal is open
  React.useEffect(() => {
    if (showSuccessModal || showConfirmModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showSuccessModal, showConfirmModal]);

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
      slot: [], // Reset slot to empty array when sport changes
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
      slot: [], // Reset slot to empty array when date changes
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

  const handleSlotChange = (slots: string[]) => {
    setFormData((prev) => ({
      ...prev,
      slot: slots,
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

    if (!formData.sport || !formData.date || !formData.slot || (Array.isArray(formData.slot) && formData.slot.length === 0) || !formData.email || !formData.mobile) {
      setCouponError('Please fill in sport, date, slot(s), email, and mobile first');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      // Calculate price after weekly discount first
      const numSlots = Array.isArray(formData.slot) ? formData.slot.length : (formData.slot ? 1 : 0);
      const pricing = calculateFinalPrice(formData.bookingType, formData.date, numSlots);
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
    
    const numSlots = Array.isArray(formData.slot) ? formData.slot.length : (formData.slot ? 1 : 0);
    if (numSlots === 0) return null;
    
    const pricing = calculateFinalPrice(formData.bookingType, formData.date, numSlots);
    let finalPriceAfterAllDiscounts = pricing.finalPrice;
    
    if (appliedCoupon) {
      finalPriceAfterAllDiscounts = Math.max(0, pricing.finalPrice - appliedCoupon.discount);
    }
    
    // For match bookings, booking charge is already included in base price (₹1200)
    // So total = finalPrice (no additional charge)
    // For practice bookings, add booking charge separately
    const effectiveBookingCharge = formData.bookingType === 'match' ? 0 : pricing.bookingCharge;
    
    return {
      basePrice: pricing.basePrice,
      weeklyDiscount: pricing.discountAmount,
      weeklyDiscountPercentage: pricing.discountPercentage,
      priceAfterWeeklyDiscount: pricing.finalPrice,
      couponDiscount: appliedCoupon?.discount || 0,
      finalPrice: finalPriceAfterAllDiscounts,
      bookingCharge: effectiveBookingCharge,
      totalPrice: finalPriceAfterAllDiscounts + effectiveBookingCharge,
      numSlots,
    };
  };

  // Show confirmation modal before booking
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

    // Show confirmation popup
    setShowConfirmModal(true);
  };

  // Actual booking submission after confirmation
  const confirmBooking = async () => {
    setShowConfirmModal(false);

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

      // Success - Store booking data from response
      const bookingData = {
        sport: data.data?.sport || formData.sport,
        date: data.data?.date || formData.date,
        slot: data.data?.slot || formData.slot,
        bookingType: data.data?.bookingType || formData.bookingType,
        email: formData.email,
      };
      
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
      
      // Store confirmed booking details separately
      setConfirmedBookingDetails(bookingData);
      
      setShowSuccessModal(true);
      
      // Reset form including coupon
      setFormData({
        bookingType,
        sport: '',
        date: getMinDate(),
        slot: [], // Reset to empty array for multiple slot selection
        name: '',
        mobile: '',
        email: '',
      });
      setErrors({});
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError(null);
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
      {/* Success Modal Popup - Using Portal */}
      {showSuccessModal && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100vw', 
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white shadow-2xl w-full max-w-sm sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Professional Header */}
              <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Booking Confirmed</h2>
                    <p className="text-xs text-gray-500">Ref: <span className="font-mono font-semibold text-green-600">{bookingRef}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 bg-gray-50">
                {/* Booking Details Card */}
                <div className="bg-white border border-gray-200 shadow-sm mb-4">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Booking Details</h3>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Booking Type</p>
                      <p className="text-sm text-gray-900 font-semibold capitalize bg-green-50 px-2.5 py-1 flex items-center gap-1.5">
                        {confirmedBookingDetails?.bookingType === 'match' ? <Trophy className="w-3.5 h-3.5 text-green-600" /> : <Target className="w-3.5 h-3.5 text-green-600" />}
                        {confirmedBookingDetails?.bookingType === 'match' ? 'Match' : 'Practice'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Sport</p>
                      <p className="text-sm text-gray-900 font-semibold capitalize">{confirmedBookingDetails?.sport || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="text-sm text-gray-900 font-semibold">{confirmedBookingDetails?.date} • {confirmedBookingDetails?.slot || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                {bookingPrice && (
                  <div className="bg-white border border-gray-200 shadow-sm mb-4">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment Summary</h3>
                    </div>
                    <div className="p-4 space-y-2.5">\n                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Original Price</p>
                          <p className={`text-sm font-semibold ${bookingPrice.discountPercentage > 0 ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            ₹{bookingPrice.basePrice}
                          </p>
                        </div>
                        
                        {bookingPrice.discountPercentage > 0 && (
                          <div className="flex justify-between items-center bg-green-50 px-3 py-1.5 border border-green-100">
                            <p className="text-xs text-green-700 font-medium">
                              Weekly Offer ({bookingPrice.discountPercentage}%)
                            </p>
                            <p className="text-sm font-bold text-green-700">
                              -₹{(bookingPrice.basePrice - bookingPrice.finalPrice - (bookingPrice.couponDiscount || 0)).toFixed(0)}
                            </p>
                          </div>
                        )}
                        
                        {/* Coupon Discount */}
                        {bookingPrice.couponDiscount && bookingPrice.couponDiscount > 0 && (
                          <div className="flex justify-between items-center bg-purple-50 px-3 py-1.5 border border-purple-100">
                            <p className="text-xs text-purple-700 font-medium flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Coupon {bookingPrice.couponCode && `(${bookingPrice.couponCode})`}
                            </p>
                            <p className="text-sm sm:text-base font-bold text-purple-700">
                              -₹{bookingPrice.couponDiscount}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 bg-green-50 px-3 py-2.5 border border-green-100">
                          <p className="text-sm text-green-700 font-semibold">Discounted Price</p>
                          <p className="text-base font-bold text-green-700">₹{bookingPrice.finalPrice}</p>
                        </div>
                        
                        {/* Only show booking charge for practice bookings */}
                        {confirmedBookingDetails?.bookingType === 'practice' && bookingPrice.bookingCharge > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Booking Charge</p>
                            <p className="text-sm font-semibold text-gray-900">₹{bookingPrice.bookingCharge}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center bg-gray-900 text-white px-4 py-3.5 mt-3">
                          <p className="text-sm font-semibold">Total Amount</p>
                          <p className="text-xl font-bold">₹{bookingPrice.totalPrice}</p>
                        </div>

                        {/* Advance Payment Info for Match Bookings */}
                        {confirmedBookingDetails?.bookingType === 'match' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between items-center bg-green-50 px-3 py-2.5 border border-green-100">
                              <p className="text-sm font-semibold text-green-800">Pay Now (Online)</p>
                              <p className="text-base font-bold text-green-700">₹{process.env.NEXT_PUBLIC_ADVANCE_PAYMENT || 200}</p>
                            </div>
                            <div className="flex justify-between items-center bg-orange-50 px-3 py-2.5 border border-orange-100">
                              <p className="text-sm font-semibold text-orange-800">Pay at Turf (Offline)</p>
                              <p className="text-base font-bold text-orange-700">
                                ₹{Math.max(0, bookingPrice.totalPrice - Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT || 200))}
                              </p>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-2.5 border border-blue-100">
                              <span className="text-blue-600 flex-shrink-0">ℹ️</span>
                              <p>Only advance payment is required now. Pay the remaining amount when you visit the turf.</p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Email Notification */}
                <div className="bg-white border border-gray-200 shadow-sm p-4 mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">Confirmation Email Sent</p>
                    <p className="text-xs text-gray-600">Check <strong className="text-gray-900">{confirmedBookingDetails?.email}</strong> for booking details</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Confirmation Modal - Before Booking */}
      {showConfirmModal && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100vw', 
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="bg-white shadow-2xl w-[90%] max-w-[420px] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <GiCricketBat className="w-4 h-4" />
                  Confirm Booking
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Booking Details */}
                <div className="bg-gray-50 p-4 space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Sport</p>
                      <p className="font-medium text-gray-800 capitalize">{formData.sport}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-800 capitalize">{formData.bookingType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-800">
                        {formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', day: 'numeric', month: 'short' 
                        }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time Slot{Array.isArray(formData.slot) && formData.slot.length > 1 ? 's' : ''}</p>
                      <p className="font-medium text-gray-800">
                        {Array.isArray(formData.slot) 
                          ? formData.slot.length > 0 
                            ? formData.slot.join(', ') 
                            : '-'
                          : formData.slot || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-800 text-xs mb-1">Customer Details</h4>
                  <div className="text-xs space-y-0.5">
                    <p className="text-blue-700"><span className="text-blue-500">Name:</span> {formData.name}</p>
                    <p className="text-blue-700"><span className="text-blue-500">Mobile:</span> +91 {formData.mobile}</p>
                    <p className="text-blue-700 break-all"><span className="text-blue-500">Email:</span> {formData.email}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                {calculateTotalWithCoupon() && (
                  <div className="bg-green-50 p-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5" />
                      Payment Summary
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-gray-800">Total Amount</span>
                        <span className="text-gray-900">₹{calculateTotalWithCoupon()?.finalPrice.toFixed(0)}</span>
                      </div>
                      {formData.bookingType === 'match' && (
                        <>
                          <div className="flex justify-between text-green-700 font-medium pt-2 border-t border-green-300">
                            <span>Pay Now (Online)</span>
                            <span>₹{Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT) || 200}</span>
                          </div>
                          <div className="flex justify-between text-orange-600">
                            <span>Pay at Turf</span>
                            <span>₹{Math.max(0, (calculateTotalWithCoupon()?.finalPrice || 0) - Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT || 200))}</span>
                          </div>
                        </>
                      )}
                      {formData.bookingType === 'practice' && (
                        <div className="flex justify-between text-green-700 font-medium">
                          <span>Pay Now</span>
                          <span>₹{calculateTotalWithCoupon()?.finalPrice.toFixed(0)}</span>
                        </div>
                      )}
                      {appliedCoupon && (
                        <div className="flex justify-between text-purple-600 text-xs pt-1 border-t border-green-200">
                          <span>Coupon: {appliedCoupon.code}</span>
                          <span>-₹{appliedCoupon.discount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Pay</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          className={`${errors.sport ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <SportSelector
            bookingType={bookingType}
            selectedSport={formData.sport}
            onSportChange={handleSportChange}
          />
          {errors.sport && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.sport}
            </p>
          )}
        </div>

        {/* Date Picker */}
        <div
          className={`${errors.date ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <TurfDatePicker
            selectedDate={formData.date}
            onDateChange={handleDateChange}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date}
            </p>
          )}
        </div>

        {/* Slot Selector */}
        <div
          className={`${errors.slot ? 'border-l-4 border-red-500 pl-3' : ''}`}
        >
          <SlotSelector
            date={formData.date}
            sport={formData.sport}
            bookingType={formData.bookingType}
            selectedSlots={Array.isArray(formData.slot) ? formData.slot : (formData.slot ? [formData.slot] : [])}
            onSlotChange={handleSlotChange}
            loading={loading}
          />
          {errors.slot && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.slot}
            </p>
          )}
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
                      {/* Slot Count Indicator */}
                      {totalPricing.numSlots > 0 && (
                        <div className="flex justify-between items-center text-sm bg-blue-50 px-3 py-1.5 border border-blue-200">
                          <span className="text-blue-700 font-medium">Selected Slots:</span>
                          <span className="font-semibold text-blue-800">{totalPricing.numSlots} slot{totalPricing.numSlots > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {/* Base Price */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Original Price:</span>
                        <span className={totalPricing.weeklyDiscountPercentage > 0 ? 'line-through text-gray-400' : 'font-semibold'}>
                          ₹{totalPricing.basePrice}
                        </span>
                      </div>
                      
                      {/* Weekly Discount */}
                      {totalPricing.weeklyDiscountPercentage > 0 && (
                        <div className="flex justify-between items-center text-sm bg-green-100 px-3 py-1.5">
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
                        <div className="flex justify-between items-center text-sm bg-purple-100 px-3 py-1.5">
                          <span className="text-purple-700 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Coupon ({appliedCoupon.code}):
                          </span>
                          <span className="font-semibold text-purple-700">-₹{totalPricing.couponDiscount.toFixed(0)}</span>
                        </div>
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
          className={`${errors.name ? 'border-l-4 border-red-500 pl-3' : ''}`}
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
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div
          className={`${errors.mobile ? 'border-l-4 border-red-500 pl-3' : ''}`}
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
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.mobile}
            </p>
          )}
        </div>

        {/* Email */}
        <div
          className={`${errors.email ? 'border-l-4 border-red-500 pl-3' : ''}`}
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
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
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
                  <span>
                    Pay ₹{formData.bookingType === 'match' 
                      ? (Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT) || 200)
                      : (calculateTotalWithCoupon()?.finalPrice.toFixed(0) || 0)
                    } & Book Now
                  </span>
                ) : (
                  <span>Book Now</span>
                )}
              </>
            )}
          </button>
          
          {/* Payment Info Note */}
          {formData.date && formData.bookingType === 'match' && calculateTotalWithCoupon() && (
            <p className="text-xs text-center mt-2 text-gray-600">
              💡 Pay ₹{Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT) || 200} now, remaining ₹{Math.max(0, (calculateTotalWithCoupon()?.finalPrice || 0) - Number(process.env.NEXT_PUBLIC_ADVANCE_PAYMENT || 200))} at turf
            </p>
          )}
        </div>
      </form>
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { CricketBox, CustomerData } from '@/types';
import { getMinDate, getMaxDate, calculateTotalPrice } from '@/utils/helpers';
import { CRICKET_BOXES } from '@/utils/dummyData';
import UserHistory from './UserHistory';
import { Calendar, User, Mail, Phone, CreditCard, MapPin } from 'lucide-react';

interface BookingFormProps {
  onSubmit: (customerData: CustomerData) => void;
  selectedDate: string;
  selectedBox: CricketBox | null;
  selectedSlots: string[];
  onDateChange: (date: string) => void;
  onBoxChange: (box: CricketBox | null) => void;
}

interface FormErrors {
  customerName?: string;
  email?: string;
  phone?: string;
  selectedDate?: string;
  selectedBox?: string;
  selectedSlots?: string;
}

// Fixed Arena - Arena A
const FIXED_ARENA = CRICKET_BOXES[0];

const BookingForm: React.FC<BookingFormProps> = ({ 
  onSubmit, 
  selectedDate, 
  selectedBox, 
  selectedSlots, 
  onDateChange, 
  onBoxChange 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select Arena A on mount
  useEffect(() => {
    if (!selectedBox) {
      onBoxChange(FIXED_ARENA);
    }
  }, [selectedBox, onBoxChange]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    if (!selectedDate) {
      newErrors.selectedDate = 'Please select a date';
    }
    
    if (selectedSlots.length === 0) {
      newErrors.selectedSlots = 'Please select at least one time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-show history when phone or email is entered (after 10 digits for phone)
  useEffect(() => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length === 10 || (email && email.includes('@'))) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  }, [phone, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          customerName,
          email: email || `phone-${phone}@booking.local`,
          phone,
        });
        
        // Reset form
        setCustomerName('');
        setEmail('');
        setPhone('');
        setErrors({});
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate total price using fixed arena
  const activeBox = selectedBox || FIXED_ARENA;
  const totalPrice = activeBox && selectedSlots.length > 0 
    ? calculateTotalPrice(activeBox.pricePerHour, selectedSlots.length)
    : 0;

  return (
    <div className="h-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fixed Arena Display */}
        <div>
          <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 mr-1" />
            Arena
          </label>
          <div className="w-full px-3 py-2.5 text-sm bg-green-50 border border-green-300 rounded-lg text-green-800 font-semibold">
            {FIXED_ARENA.name} - ₹{FIXED_ARENA.pricePerHour}/hour
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.selectedDate && (
            <p className="text-red-500 text-xs mt-1">{errors.selectedDate}</p>
          )}
        </div>

        {errors.selectedSlots && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs">{errors.selectedSlots}</p>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 mr-1" />
            Mobile Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 mr-1" />
            Email (Optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* User History Section */}
        {showHistory && (
          <div className="mt-2">
            <UserHistory phone={phone} email={email} />
          </div>
        )}

        {/* Price Summary */}
        {selectedSlots.length > 0 && activeBox && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium text-sm">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-sm font-semibold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{totalPrice}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || selectedSlots.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Proceed to Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;

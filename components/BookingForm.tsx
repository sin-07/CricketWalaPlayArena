'use client';

import React, { useState, useEffect } from 'react';
import { CricketBox, CustomerData } from '@/types';
import { getMinDate, getMaxDate } from '@/utils/helpers';
import { CRICKET_BOXES } from '@/utils/dummyData';
import UserHistory from './UserHistory';

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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        customerName,
        email,
        phone,
      });
      
      // Reset form
      setCustomerName('');
      setEmail('');
      setPhone('');
      setErrors({});
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">
        Booking Details
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date Selection */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Select Date *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* User History Section */}
        {showHistory && (
          <div className="mt-2">
            <UserHistory phone={phone} email={email} />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-primary-700 transition-colors shadow-md"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookingForm;

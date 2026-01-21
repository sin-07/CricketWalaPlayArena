'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, Hash, Calendar, Clock, User, Mail, MapPin, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';

interface Booking {
  _id: string;
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string;
  slot: string;
  name: string;
  mobile: string;
  email: string;
  basePrice: number;
  finalPrice: number;
  totalPrice?: number;
  discountPercentage: number;
  couponCode?: string;
  couponDiscount?: number;
  source?: 'online' | 'offline';
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function MyBookingsPage() {
  const [searchType, setSearchType] = useState<'phone' | 'ref'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearched(true);

    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    if (searchType === 'phone' && !/^[6-9]\d{9}$/.test(searchValue)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const queryParam = searchType === 'phone' ? `mobile=${searchValue}` : `ref=${searchValue}`;
      const response = await fetch(`/api/turf-bookings/search?${queryParam}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message || 'Failed to fetch bookings');
        setBookings([]);
      }
    } catch (err) {
      setError('Failed to search bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic status based on booking time
  const getCalculatedStatus = (booking: Booking) => {
    if (booking.status === 'cancelled') return 'cancelled';
    
    const slots = booking.slot.split(',').map(s => s.trim());
    const lastSlot = slots[slots.length - 1];
    const endTime = lastSlot.split('-')[1];
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const bookingDate = new Date(booking.date);
    if (endHour === 0 && endMinute === 0) {
      bookingDate.setDate(bookingDate.getDate() + 1);
      bookingDate.setHours(0, 0, 0, 0);
    } else {
      bookingDate.setHours(endHour, endMinute, 0, 0);
    }
    
    return new Date() > bookingDate ? 'completed' : 'active';
  };

  const getStatusBadge = (booking: Booking) => {
    const status = getCalculatedStatus(booking);
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: 'ACTIVE' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'COMPLETED' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: 'CANCELLED' },
    };
    const { bg, text, border, label } = config[status] || config.active;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${bg} ${text} border ${border}`}>
        {label}
      </span>
    );
  };

  const getBookingRef = (id: string) => {
    const numericPart = parseInt(id.slice(-8), 16).toString().slice(-4).padStart(4, '0');
    return `CWPA${numericPart}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg mb-4">
            <GiCricketBat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">Search your bookings by phone number or booking reference</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
              <button
                type="button"
                onClick={() => { setSearchType('phone'); setSearchValue(''); setError(''); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'phone'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('ref'); setSearchValue(''); setError(''); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'ref'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Hash className="w-4 h-4 inline mr-2" />
                Booking Ref
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {searchType === 'phone' ? <Phone className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
              </div>
              <input
                type={searchType === 'phone' ? 'tel' : 'text'}
                value={searchValue}
                onChange={(e) => {
                  const val = searchType === 'phone' 
                    ? e.target.value.replace(/\D/g, '').slice(0, 10)
                    : e.target.value.toUpperCase();
                  setSearchValue(val);
                }}
                placeholder={searchType === 'phone' ? 'Enter 10-digit mobile number' : 'Enter booking ref (e.g., CWPA1234)'}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg"
                maxLength={searchType === 'phone' ? 10 : 10}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {/* Search Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search Bookings
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600">Searching for your bookings...</p>
            </motion.div>
          ) : searched && bookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
            >
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">
                {searchType === 'phone' 
                  ? 'No bookings found for this phone number.' 
                  : 'No booking found with this reference.'}
              </p>
            </motion.div>
          ) : bookings.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-gray-600 mb-4">
                Found <span className="font-semibold text-green-700">{bookings.length}</span> booking{bookings.length !== 1 ? 's' : ''}
              </p>
              
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  {/* Booking Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono font-bold text-lg">
                        {getBookingRef(booking._id)}
                      </span>
                      <span className="px-2 py-1 bg-white/20 rounded text-white text-xs font-medium">
                        {booking.sport}
                      </span>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  {/* Booking Details */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{booking.slot}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-green-600" />
                        <span>{booking.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>{booking.mobile}</span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="capitalize">{booking.bookingType}</span> Booking
                        {booking.couponCode && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            {booking.couponCode}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {booking.discountPercentage > 0 && (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{booking.basePrice}
                          </div>
                        )}
                        <div className="text-xl font-bold text-green-600">
                          ₹{booking.totalPrice || booking.finalPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

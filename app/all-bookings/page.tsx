'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { normalizePhoneNumber } from '@/utils/phoneUtils';
import { FaPhone, FaClipboardList, FaCalendarAlt, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';

const AllBookingsPage: React.FC = () => {
  const [searchType, setSearchType] = useState<'bookingRef' | 'phone' | 'date'>('bookingRef');
  const [searchValue, setSearchValue] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const params = new URLSearchParams();
      params.append(searchType, searchValue.trim());

      const response = await fetch(`/api/bookings/search?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.error || 'Failed to search bookings');
        setBookings([]);
      }
    } catch (err) {
      setError('Failed to search bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setBookings([]);
    setHasSearched(false);
    setError(null);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Display status - treat confirmed as Active
  const getDisplayStatus = (status?: string) => {
    if (status === 'confirmed' || status === 'active') return 'ACTIVE';
    if (status === 'completed') return 'COMPLETED';
    if (status === 'cancelled') return 'CANCELLED';
    return 'ACTIVE';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (slotId: number | string | undefined) => {
    // Handle turf booking format (string like "06:00-07:00")
    if (typeof slotId === 'string') {
      return slotId;
    }
    
    // Handle old booking format (numeric ID)
    if (typeof slotId === 'number') {
      const startTime = `${slotId.toString().padStart(2, '0')}:00`;
      const endTime = `${(slotId + 1).toString().padStart(2, '0')}:00`;
      return `${startTime} - ${endTime}`;
    }
    
    // Default fallback
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">All Bookings</h1>
          <p className="text-gray-600">Search and view your booking details</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Your Bookings</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search By
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSearchType('bookingRef')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    searchType === 'bookingRef'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaClipboardList /> Booking ID
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('phone')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchType === 'phone'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaPhone className="inline mr-1" /> Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('date')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    searchType === 'date'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaCalendarAlt /> Date
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'bookingRef' && 'Enter Booking ID'}
                {searchType === 'phone' && 'Enter Mobile Number'}
                {searchType === 'date' && 'Select Date'}
              </label>
              {searchType === 'date' ? (
                <input
                  type="date"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    if (searchType === 'phone') {
                      setSearchValue(normalizePhoneNumber(e.target.value));
                    } else {
                      setSearchValue(e.target.value);
                    }
                  }}
                  onPaste={(e) => {
                    if (searchType === 'phone') {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      setSearchValue(normalizePhoneNumber(pastedText));
                    }
                  }}
                  placeholder={
                    searchType === 'bookingRef'
                      ? 'e.g., CB-1234567890'
                      : searchType === 'phone'
                      ? 'e.g., 9876543210'
                      : ''
                  }
                  maxLength={searchType === 'phone' ? 10 : undefined}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* Search Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaSearch /> {loading ? 'Searching...' : 'Search Bookings'}
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Search Results ({bookings.length})
              </h2>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center">
                <FaSearch className="text-6xl mb-4 text-gray-400 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
                <p className="text-gray-600">
                  No bookings match your search criteria. Please try a different search.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <div
                    key={booking._id || index}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                              booking.status
                            )}`}
                          >
                            {getDisplayStatus(booking.status)}
                          </span>
                          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
                            {booking.bookingRef}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Customer Details</p>
                            <p className="text-sm font-semibold text-gray-800">{booking.customerName}</p>
                            <p className="text-xs text-gray-600">📧 {booking.email}</p>
                            <p className="text-xs text-gray-600 flex items-center"><FaPhone className="mr-1" /> {booking.phone}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Booking Details</p>
                            <p className="text-sm font-semibold text-gray-800">{booking.boxName}</p>
                            <p className="text-xs text-gray-600">📅 {formatDate(booking.date)}</p>
                            <p className="text-xs text-gray-600">
                              ⏰ {(booking as any).slot 
                                ? (booking as any).slot
                                : booking.timeSlotIds && booking.timeSlotIds.length > 0
                                ? `${booking.timeSlotIds.length} slot${booking.timeSlotIds.length > 1 ? 's' : ''}: ${booking.timeSlotIds.sort((a, b) => a - b).map(id => formatTime(id)).join(', ')}`
                                : formatTime(booking.timeSlotId)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Price */}
                      <div className="lg:text-right">
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="text-3xl font-bold text-primary-600">₹{booking.totalAmount}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Booked on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4"><GiCricketBat className="text-gray-400" /></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Search</h3>
            <p className="text-gray-600">
              Enter your booking details above to view your bookings
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBookingsPage;

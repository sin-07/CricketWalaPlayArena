'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '@/types';

interface UserHistoryProps {
  phone?: string;
  email?: string;
  onHistoryLoad?: (bookings: Booking[]) => void;
}

interface UserHistoryData {
  bookings: Booking[];
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

const UserHistory: React.FC<UserHistoryProps> = ({ phone, email, onHistoryLoad }) => {
  const [historyData, setHistoryData] = useState<UserHistoryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const fetchUserHistory = async () => {
    if (!phone && !email) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (email) params.append('email', email);

      const response = await fetch(`/api/bookings/history?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setHistoryData(result.data);
        if (onHistoryLoad) {
          onHistoryLoad(result.data.bookings);
        }
      } else {
        setError(result.error || 'Failed to fetch booking history');
      }
    } catch (err) {
      setError('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone || email) {
      fetchUserHistory();

      // Poll for updates every 15 seconds
      const interval = setInterval(fetchUserHistory, 15000);
      return () => clearInterval(interval);
    }
  }, [phone, email]);

  if (!phone && !email) return null;

  if (loading) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <p className="text-sm text-purple-700">Loading your booking history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    );
  }

  if (!historyData || historyData.totalBookings === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 flex items-center">
          <span className="mr-2">ℹ️</span>
          No previous bookings found for this contact.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
            <span className="mr-2">📋</span>
            Your Booking History
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {isExpanded ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-lg font-bold text-purple-600">{historyData.totalBookings}</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="text-xs text-gray-600">Active</div>
            <div className="text-lg font-bold text-green-600">{historyData.activeBookings}</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm text-center">
            <div className="text-xs text-gray-600">Completed</div>
            <div className="text-lg font-bold text-blue-600">{historyData.completedBookings}</div>
          </div>
        </div>
      </div>

      {/* Booking List */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {historyData.bookings.map((booking, index) => (
              <div
                key={booking._id || index}
                className={`p-4 ${
                  index !== historyData.bookings.length - 1 ? 'border-b border-gray-100' : ''
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {booking.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{booking.bookingRef}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-800">{booking.boxName}</p>
                      <p className="text-xs text-gray-600">
                        📅 {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        ⏰ {booking.timeSlotIds && booking.timeSlotIds.length > 0
                          ? `${booking.timeSlotIds.length} slot${booking.timeSlotIds.length > 1 ? 's' : ''}`
                          : '1 slot'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">₹{booking.totalAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Update Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <span>Syncing history</span>
      </div>
    </div>
  );
};

export default UserHistory;

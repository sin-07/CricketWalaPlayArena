'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking } from '@/types';

interface BookingHistoryProps {
  phone?: string;
  email?: string;
}

const BookingHistoryComponent: React.FC<BookingHistoryProps> = ({ phone, email }) => {
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  useEffect(() => {
    if (phone || email) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 15000);
      return () => clearInterval(interval);
    }
  }, [phone, email]);

  const fetchHistory = async () => {
    if (!phone && !email) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (phone) params.append('phone', phone);
      if (email) params.append('email', email);

      const response = await fetch(`/api/bookings/history?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setHistory(result.data.bookings);
        setStats({
          total: result.data.totalBookings,
          active: result.data.activeBookings,
          completed: result.data.completedBookings,
        });
      }
    } catch (error) {
      console.error('Failed to fetch booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!phone && !email) return null;

  if (loading && history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600">Loading your booking history...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (stats.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <History className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No previous bookings found</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-primary-200 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <History className="w-5 h-5 mr-2 text-primary-600" />
              Your Booking History
            </CardTitle>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-600 mt-1">Active</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-xs text-gray-600 mt-1">Completed</div>
            </div>
          </div>

          {/* Booking List */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 max-h-64 overflow-y-auto"
              >
                {history.slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {booking.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {booking.bookingRef}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-3 h-3 mr-2" />
                        <span className="font-medium">{booking.boxName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3 h-3 mr-2" />
                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-3 h-3 mr-2" />
                        <span>
                          {booking.timeSlotIds?.length || 1} slot
                          {(booking.timeSlotIds?.length || 1) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{booking.totalAmount}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingHistoryComponent;

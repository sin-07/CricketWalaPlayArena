'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Calendar, TrendingUp, Plus, Table as TableIcon, Clock, LogOut } from 'lucide-react';
import AdminBookingForm from '@/components/AdminBookingForm';
import AdminTable from '@/components/AdminTable';
import NotificationSystem, {
  Notification,
  NotificationType,
} from '@/components/NotificationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// Session timeout: 2 hours in milliseconds
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

interface Booking {
  _id: string;
  boxId: number;
  boxName: string;
  date: string;
  timeSlotId: number;
  timeSlotIds: number[];
  customerName: string;
  email: string;
  phone: string;
  pricePerHour: number;
  totalAmount: number;
  bookingRef: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'create'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  // Check session and set up auto-logout
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Check if session has expired
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      if (elapsed >= SESSION_TIMEOUT) {
        handleSessionExpired();
        return;
      }

      // Set timeout for remaining time
      const remainingTime = SESSION_TIMEOUT - elapsed;
      const timeoutId = setTimeout(() => {
        handleSessionExpired();
      }, remainingTime);

      setIsAuthenticated(true);
      return () => clearTimeout(timeoutId);
    } else {
      // Set login time if not already set
      localStorage.setItem('adminLoginTime', Date.now().toString());
      setIsAuthenticated(true);

      // Set timeout for full session
      const timeoutId = setTimeout(() => {
        handleSessionExpired();
      }, SESSION_TIMEOUT);

      return () => clearTimeout(timeoutId);
    }
  }, [router]);

  const handleSessionExpired = () => {
    setShowSessionExpired(true);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    setIsAuthenticated(false);
  };

  const handleLoginAgain = () => {
    setShowSessionExpired(false);
    router.push('/admin/login');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchBookings();
    
    // Real-time updates every 30 seconds instead of 8
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList: Booking[]) => {
    const active = bookingsList.filter((b) => b.status === 'active').length;
    const completed = bookingsList.filter((b) => b.status === 'completed').length;
    const revenue = bookingsList.reduce((sum, b) => sum + b.totalAmount, 0);

    setStats({
      totalBookings: bookingsList.length,
      activeBookings: active,
      completedBookings: completed,
      totalRevenue: revenue,
    });
  };

  const addNotification = (message: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleBookingComplete = () => {
    fetchBookings();
    addNotification('Offline booking created successfully!', 'success');
    setActiveTab('bookings');
  };

  if (!isAuthenticated && !showSessionExpired) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Expired Modal */}
      <AnimatePresence>
        {showSessionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Session Expired</h2>
              <p className="text-gray-600 mb-6">
                Your admin session has expired. For security reasons, sessions automatically expire after 2 hours. Please login again to continue.
              </p>
              <button
                onClick={handleLoginAgain}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Login Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-0 sm:px-4 py-4 sm:py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 sm:mb-8 px-4 sm:px-0"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage bookings and customer data</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 rounded-none sm:rounded-lg border-2 border-green-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center text-green-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{stats.totalBookings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 rounded-none sm:rounded-lg border-2 border-green-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center text-green-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Active Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{stats.activeBookings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 rounded-none sm:rounded-lg border-2 border-green-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center text-green-700">
                  <Users className="w-4 h-4 mr-2" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{stats.completedBookings}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 rounded-none sm:rounded-lg border-2 border-green-200 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center text-green-700">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">₹{stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6 px-4 sm:px-0"
        >
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
            className="flex items-center"
          >
            <TableIcon className="w-4 h-4 mr-2" />
            All Bookings
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Offline Booking
          </Button>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'bookings' ? (
            <AdminTable bookings={bookings} loading={loading} />
          ) : (
            <div className="max-w-3xl mx-auto">
              <AdminBookingForm
                onBookingComplete={handleBookingComplete}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

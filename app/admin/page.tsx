'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Calendar, TrendingUp, Plus, Table as TableIcon, Clock, LogOut, Snowflake, Tag, Mail } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';
import AdminBookingForm from '@/components/AdminBookingForm';
import AdminTable from '@/components/AdminTable';
import AdminCouponManager from '@/components/AdminCouponManager';
import AdminNewsletterManager from '@/components/AdminNewsletterManager';
import NotificationSystem, {
  Notification,
  NotificationType,
} from '@/components/NotificationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// Session timeout: 2 hours in milliseconds
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

// TurfBooking interface matching the TurfBooking model
interface TurfBooking {
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
  discountPercentage: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Keep old Booking interface for backward compatibility
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'create' | 'coupons' | 'newsletter'>('bookings');
  const [turfBookings, setTurfBookings] = useState<TurfBooking[]>([]);
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
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin/login');
          return;
        }

        // Check if session has expired based on login time
        if (data.loginTime) {
          const elapsed = Date.now() - data.loginTime;
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
          setLoading(false);
          return () => clearTimeout(timeoutId);
        } else {
          // Refresh session time
          await fetch('/api/admin/refresh-session', {
            method: 'POST',
            credentials: 'include',
          });
          setIsAuthenticated(true);
          setLoading(false);

          // Set timeout for full session
          const timeoutId = setTimeout(() => {
            handleSessionExpired();
          }, SESSION_TIMEOUT);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const handleSessionExpired = async () => {
    setShowSessionExpired(true);
    // Clear cookies via API
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
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
      const response = await axios.get('/api/turf-bookings');
      console.log('📊 Admin Dashboard - API Response:', response.data);
      console.log('📊 Admin Dashboard - Bookings count:', response.data.data?.length);
      console.log('📊 Admin Dashboard - First booking:', response.data.data?.[0]);
      if (response.data.success) {
        setTurfBookings(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList: TurfBooking[]) => {
    console.log('📊 Calculating stats for bookings:', bookingsList.length);
    console.log('📊 Booking statuses:', bookingsList.map(b => b.status));
    const active = bookingsList.filter((b) => b.status === 'confirmed').length;
    const completed = bookingsList.filter((b) => b.status === 'completed').length;
    const revenue = bookingsList.reduce((sum, b) => sum + b.finalPrice, 0);

    console.log('📊 Stats calculated - Active:', active, 'Completed:', completed, 'Total:', bookingsList.length);

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

  // Show loading screen while checking authentication
  if (!isAuthenticated && !showSessionExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: [0, -20, 20, -20, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 flex items-center justify-center"
          >
            <GiCricketBat className="w-8 h-8 text-white" />
          </motion.div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
              />
            ))}
          </div>
          <p className="text-green-700 font-medium">Loading Dashboard...</p>
        </motion.div>
      </div>
    );
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
          <Button
            variant="outline"
            onClick={() => router.push('/admin/slots')}
            className="flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <Snowflake className="w-4 h-4 mr-2" />
            Manage Frozen Slots
          </Button>
          <Button
            variant={activeTab === 'coupons' ? 'default' : 'outline'}
            onClick={() => setActiveTab('coupons')}
            className="flex items-center bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
          >
            <Tag className="w-4 h-4 mr-2" />
            Manage Coupons
          </Button>
          <Button
            variant={activeTab === 'newsletter' ? 'default' : 'outline'}
            onClick={() => setActiveTab('newsletter')}
            className="flex items-center bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            Newsletter
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
            <AdminTable turfBookings={turfBookings} loading={loading} />
          ) : activeTab === 'create' ? (
            <div className="max-w-3xl mx-auto">
              <AdminBookingForm
                onBookingComplete={handleBookingComplete}
              />
            </div>
          ) : activeTab === 'coupons' ? (
            <div className="max-w-7xl mx-auto">
              <AdminCouponManager />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <AdminNewsletterManager />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

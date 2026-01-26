'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Settings, Users, Tag, Calendar, Mail, Image, 
  BarChart3, Lock, Unlock, RefreshCw, 
  Clock, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Permissions {
  // Coupon Management
  canCreateCoupon: boolean;
  canEditCoupon: boolean;
  canDeleteCoupon: boolean;
  canViewCoupons: boolean;
  
  // Booking Management
  canCreateBooking: boolean;
  canEditBooking: boolean;
  canDeleteBooking: boolean;
  canViewBookings: boolean;
  
  // Slot Management
  canFreezeSlots: boolean;
  canUnfreezeSlots: boolean;
  canViewSlots: boolean;
  
  // Newsletter Management
  canSendNewsletter: boolean;
  canManageSubscribers: boolean;
  canViewNewsletter: boolean;
  
  // Gallery Management
  canUploadGallery: boolean;
  canDeleteGallery: boolean;
  canViewGallery: boolean;
  
  // Dashboard Access
  canViewDashboard: boolean;
  canViewStats: boolean;
}

const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

const permissionCategories = [
  {
    title: 'Coupon Management',
    icon: Tag,
    color: 'purple',
    permissions: [
      { key: 'canCreateCoupon', label: 'Create Coupons', description: 'Allow admin to create new discount coupons' },
      { key: 'canEditCoupon', label: 'Edit Coupons', description: 'Allow admin to modify existing coupons' },
      { key: 'canDeleteCoupon', label: 'Delete Coupons', description: 'Allow admin to remove coupons' },
      { key: 'canViewCoupons', label: 'View Coupons', description: 'Allow admin to see coupon list' },
    ],
  },
  {
    title: 'Booking Management',
    icon: Calendar,
    color: 'green',
    permissions: [
      { key: 'canCreateBooking', label: 'Create Bookings', description: 'Allow admin to create offline bookings' },
      { key: 'canEditBooking', label: 'Edit Bookings', description: 'Allow admin to modify bookings' },
      { key: 'canDeleteBooking', label: 'Delete Bookings', description: 'Allow admin to cancel/delete bookings' },
      { key: 'canViewBookings', label: 'View Bookings', description: 'Allow admin to see all bookings' },
    ],
  },
  {
    title: 'Slot Management',
    icon: Clock,
    color: 'blue',
    permissions: [
      { key: 'canFreezeSlots', label: 'Freeze Slots', description: 'Allow admin to freeze time slots' },
      { key: 'canUnfreezeSlots', label: 'Unfreeze Slots', description: 'Allow admin to unfreeze time slots' },
      { key: 'canViewSlots', label: 'View Slots', description: 'Allow admin to see slot management' },
    ],
  },
  {
    title: 'Newsletter Management',
    icon: Mail,
    color: 'orange',
    permissions: [
      { key: 'canSendNewsletter', label: 'Send Newsletter', description: 'Allow admin to send newsletters' },
      { key: 'canManageSubscribers', label: 'Manage Subscribers', description: 'Allow admin to manage subscriber list' },
      { key: 'canViewNewsletter', label: 'View Newsletter', description: 'Allow admin to see newsletter section' },
    ],
  },
  {
    title: 'Gallery Management',
    icon: Image,
    color: 'pink',
    permissions: [
      { key: 'canUploadGallery', label: 'Upload Images', description: 'Allow admin to upload gallery images' },
      { key: 'canDeleteGallery', label: 'Delete Images', description: 'Allow admin to remove gallery images' },
      { key: 'canViewGallery', label: 'View Gallery', description: 'Allow admin to see gallery section' },
    ],
  },
  {
    title: 'Dashboard Access',
    icon: BarChart3,
    color: 'cyan',
    permissions: [
      { key: 'canViewDashboard', label: 'View Dashboard', description: 'Allow admin to access main dashboard' },
      { key: 'canViewStats', label: 'View Statistics', description: 'Allow admin to see revenue and booking stats' },
    ],
  },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [permissions, setPermissions] = useState<Permissions>({
    canCreateCoupon: true,
    canEditCoupon: true,
    canDeleteCoupon: true,
    canViewCoupons: true,
    canCreateBooking: true,
    canEditBooking: true,
    canDeleteBooking: true,
    canViewBookings: true,
    canFreezeSlots: true,
    canUnfreezeSlots: true,
    canViewSlots: true,
    canSendNewsletter: true,
    canManageSubscribers: true,
    canViewNewsletter: true,
    canUploadGallery: true,
    canDeleteGallery: true,
    canViewGallery: true,
    canViewDashboard: true,
    canViewStats: true,
  });

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
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

        // Check if user is super admin
        if (data.role !== 'superadmin') {
          router.push('/admin');
          return;
        }

        setIsSuperAdmin(true);
        setIsAuthenticated(true);
        
        // Load permissions
        await fetchPermissions();
        
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/superadmin/permissions', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.permissions) {
          setPermissions(data.permissions);
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const savePermissions = async (newPermissions: Permissions) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/superadmin/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ permissions: newPermissions }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Permissions updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update permissions' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving permissions' });
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = async (key: string, value: boolean) => {
    const newPermissions = {
      ...permissions,
      [key]: value,
    };
    setPermissions(newPermissions);
    // Auto-save when permission is toggled
    await savePermissions(newPermissions);
  };

  const handleEnableAll = async () => {
    const allEnabled = Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof Permissions] = true;
      return acc;
    }, {} as Permissions);
    setPermissions(allEnabled);
    await savePermissions(allEnabled);
  };

  const handleDisableAll = async () => {
    const allDisabled = Object.keys(permissions).reduce((acc, key) => {
      acc[key as keyof Permissions] = false;
      return acc;
    }, {} as Permissions);
    setPermissions(allDisabled);
    await savePermissions(allDisabled);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'text-pink-600' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-600' },
    };
    return colors[color] || colors.green;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/30 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-purple-200 font-medium">Loading Super Admin...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Super Admin Panel</h1>
                <p className="text-sm text-purple-200">Permission Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/admin')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={handleEnableAll}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Enable All Permissions
          </Button>
          <Button
            onClick={handleDisableAll}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            Disable All Permissions
          </Button>
          <Button
            onClick={fetchPermissions}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Permission Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {permissionCategories.map((category, index) => {
            const colorClasses = getColorClasses(category.color);
            const Icon = category.icon;
            
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
                  <CardHeader className={`${colorClasses.bg} border-b ${colorClasses.border}`}>
                    <CardTitle className={`flex items-center gap-2 ${colorClasses.text}`}>
                      <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {category.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{perm.label}</p>
                          <p className="text-gray-400 text-xs">{perm.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={permissions[perm.key as keyof Permissions]}
                            onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-300 font-semibold mb-1">Important Note</h3>
              <p className="text-yellow-200/80 text-sm">
                Changes to permissions take effect immediately. Admin users will need to refresh their page 
                to see the updated permissions. Super admins always have full access to all features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

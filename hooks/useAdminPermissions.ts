'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AdminPermissions {
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

interface UseAdminPermissionsReturn {
  permissions: AdminPermissions;
  role: 'admin' | 'superadmin' | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
}

const defaultPermissions: AdminPermissions = {
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
};

export function useAdminPermissions(): UseAdminPermissionsReturn {
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);
  const [role, setRole] = useState<'admin' | 'superadmin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        if (data.role) {
          setRole(data.role);
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
    // Super admin always has all permissions
    if (role === 'superadmin') return true;
    return permissions[permission];
  }, [permissions, role]);

  return {
    permissions,
    role,
    isLoading,
    isSuperAdmin: role === 'superadmin',
    refreshPermissions: fetchPermissions,
    hasPermission,
  };
}

export default useAdminPermissions;

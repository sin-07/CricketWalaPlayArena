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
  canCreateCoupon: false,
  canEditCoupon: false,
  canDeleteCoupon: false,
  canViewCoupons: false,
  canCreateBooking: false,
  canEditBooking: false,
  canDeleteBooking: false,
  canViewBookings: false,
  canFreezeSlots: false,
  canUnfreezeSlots: false,
  canViewSlots: false,
  canSendNewsletter: false,
  canManageSubscribers: false,
  canViewNewsletter: false,
  canUploadGallery: false,
  canDeleteGallery: false,
  canViewGallery: false,
  canViewDashboard: false,
  canViewStats: false,
};

export function useAdminPermissions(): UseAdminPermissionsReturn {
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);
  const [role, setRole] = useState<'admin' | 'superadmin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      console.log('[useAdminPermissions] Fetching permissions...');
      const response = await fetch('/api/admin/permissions', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[useAdminPermissions] Received data:', data);
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        if (data.role) {
          setRole(data.role);
        }
      } else {
        console.log('[useAdminPermissions] Response not OK:', response.status);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    
    // Poll for permission updates every 2 seconds for faster sync
    const interval = setInterval(() => {
      fetchPermissions();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
    // Still loading permissions, deny by default
    if (isLoading) return false;
    // Super admin always has all permissions
    if (role === 'superadmin') return true;
    return permissions[permission];
  }, [permissions, role, isLoading]);

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

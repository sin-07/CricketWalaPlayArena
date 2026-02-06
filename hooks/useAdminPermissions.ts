'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

// Cache permissions in memory to avoid refetching on re-renders
let cachedPermissions: AdminPermissions | null = null;
let cachedRole: 'admin' | 'superadmin' | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export function useAdminPermissions(): UseAdminPermissionsReturn {
  const [permissions, setPermissions] = useState<AdminPermissions>(cachedPermissions || defaultPermissions);
  const [role, setRole] = useState<'admin' | 'superadmin' | null>(cachedRole);
  const [isLoading, setIsLoading] = useState(!cachedPermissions);
  const fetchedRef = useRef(false);

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
          cachedPermissions = data.permissions;
        }
        if (data.role) {
          setRole(data.role);
          cachedRole = data.role;
        }
        lastFetchTime = Date.now();
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip if already fetched in this mount or cache is fresh
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const isCacheFresh = cachedPermissions && (Date.now() - lastFetchTime < CACHE_TTL);
    
    if (isCacheFresh) {
      setPermissions(cachedPermissions!);
      setRole(cachedRole);
      setIsLoading(false);
      return;
    }

    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permission: keyof AdminPermissions): boolean => {
    if (isLoading) return false;
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

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import AdminSlotFreezeManager from '@/components/AdminSlotFreezeManager';
import { Snowflake, Shield } from 'lucide-react';

export default function AdminSlotFreezePage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();
  const { hasPermission, isLoading: permissionsLoading } = useAdminPermissions();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  // Redirect if no slot view permission
  useEffect(() => {
    if (!permissionsLoading && isAdmin && !hasPermission('canViewSlots')) {
      router.push('/admin');
    }
  }, [permissionsLoading, isAdmin, hasPermission, router]);

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Snowflake className="w-8 h-8 text-green-600 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading Slot Manager...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !hasPermission('canViewSlots')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don&apos;t have permission to access slot management.</p>
        </div>
      </div>
    );
  }

  return <AdminSlotFreezeManager />;
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSlotFreezeManager from '@/components/AdminSlotFreezeManager';
import { Snowflake } from 'lucide-react';

export default function AdminSlotFreezePage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
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

  if (!isAdmin) {
    return null;
  }

  return <AdminSlotFreezeManager />;
}

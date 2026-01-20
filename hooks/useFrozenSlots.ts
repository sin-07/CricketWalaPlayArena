'use client';

import { useState } from 'react';

export function useFrozenSlots() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const freezeSlot = async (bookingType: string, sport: string, date: string, slot: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/slots/freeze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingType,
          sport,
          date,
          slot,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to freeze slot');
        return { success: false };
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      const message = err.message || 'Error freezing slot';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const unfreezeSlot = async (bookingType: string, sport: string, date: string, slot: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/slots/unfreeze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingType,
          sport,
          date,
          slot,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to unfreeze slot');
        return { success: false };
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      const message = err.message || 'Error unfreezing slot';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const getFrozenSlots = async (bookingType?: string, sport?: string, date?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (bookingType) params.append('bookingType', bookingType);
      if (sport) params.append('sport', sport);
      if (date) params.append('date', date);

      const response = await fetch(`/api/admin/slots/get-frozen?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch frozen slots');
        return { success: false, data: [] };
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      const message = err.message || 'Error fetching frozen slots';
      setError(message);
      return { success: false, data: [], error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    freezeSlot,
    unfreezeSlot,
    getFrozenSlots,
  };
}

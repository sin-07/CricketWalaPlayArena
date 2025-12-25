'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { bookingService } from '@/services/bookingService';

// Custom hook to manage bookings
const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Fetch bookings from API
  const fetchBookings = async (params?: { boxId?: number; date?: string; email?: string }) => {
    try {
      // Only show loading on subsequent fetches, not initial load
      if (!isInitialLoad) {
        setLoading(true);
      }
      const response = await bookingService.getBookings(params);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const addBooking = async (booking: Booking): Promise<Booking | null> => {
    try {
      const response = await bookingService.createBooking(booking);
      if (response.success) {
        await fetchBookings(); // Refresh bookings
        return response.data[0];
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      throw err;
    }
  };

  const isSlotAvailable = (boxId: number, date: string, timeSlotId: number): boolean => {
    return !bookings.some(
      (booking) =>
        booking.boxId === boxId &&
        booking.date === date &&
        (booking as any).status === 'active' &&
        (
          // Check both timeSlotIds array and legacy timeSlotId
          (booking.timeSlotIds && booking.timeSlotIds.includes(timeSlotId)) ||
          booking.timeSlotId === timeSlotId
        )
    );
  };

  const refreshBookings = () => {
    fetchBookings();
  };

  return { bookings, addBooking, isSlotAvailable, loading, error, refreshBookings, fetchBookings };
};

export default useBookings;

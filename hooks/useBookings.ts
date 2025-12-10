'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { bookingService } from '@/services/bookingService';

// Custom hook to manage bookings
const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from API
  const fetchBookings = async (params?: { boxId?: number; date?: string; email?: string }) => {
    try {
      setLoading(true);
      const response = await bookingService.getBookings(params);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
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
        booking.timeSlotId === timeSlotId &&
        (booking as any).status === 'active'
    );
  };

  const refreshBookings = () => {
    fetchBookings();
  };

  return { bookings, addBooking, isSlotAvailable, loading, error, refreshBookings, fetchBookings };
};

export default useBookings;

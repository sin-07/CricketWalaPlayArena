import axios from 'axios';
import { Booking } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const bookingService = {
  // Get all bookings or filter by params
  async getBookings(params?: { boxId?: number; date?: string; email?: string }) {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    const response = await axios.get(`${API_URL}/api/bookings?${query}`);
    return response.data;
  },

  // Create a new booking
  async createBooking(bookingData: Omit<Booking, '_id' | 'createdAt'>) {
    const response = await axios.post(`${API_URL}/api/bookings`, bookingData);
    return response.data;
  },

  // Get availability for a box within a date range
  async getAvailability(boxId: number, startDate: string, endDate: string) {
    const response = await axios.get(
      `${API_URL}/api/bookings/availability?boxId=${boxId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
};

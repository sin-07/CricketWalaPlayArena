'use client';

import React from 'react';
import Link from 'next/link';
import useBookings from '@/hooks/useBookings';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { TIME_SLOTS, CRICKET_BOXES } from '@/utils/dummyData';

interface GroupedBooking {
  customerName: string;
  date: string;
  boxId: number;
  slots: number[];
}

export default function MyBookings() {
  const { bookings, loading } = useBookings();

  // Group bookings by booking reference
  const groupedBookings = bookings.reduce<Record<string, GroupedBooking>>((acc, booking) => {
    const key = booking.customerName + booking.date + booking.boxId;
    if (!acc[key]) {
      acc[key] = {
        customerName: booking.customerName,
        date: booking.date,
        boxId: booking.boxId,
        slots: [],
      };
    }
    acc[key].slots.push(booking.timeSlotId);
    return acc;
  }, {});

  const getBoxName = (boxId: number): string => {
    const box = CRICKET_BOXES.find(b => b.id === boxId);
    return box ? box.name : 'Unknown Box';
  };

  const getTimeSlotDisplay = (slotId: number): string => {
    const slot = TIME_SLOTS.find(s => s.id === `slot-${slotId}`);
    return slot ? slot.display : slotId.toString();
  };

  const getBoxPrice = (boxId: number): number => {
    const box = CRICKET_BOXES.find(b => b.id === boxId);
    return box ? box.pricePerHour : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Bookings</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedBookings).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Bookings</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Bookings Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t made any bookings yet. Start by booking a Cricket Wala Play Arena slot!
            </p>
            <Link
              href="/booking"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage all your Cricket Wala Play Arena bookings
          </p>
        </div>

        <div className="grid gap-6">
          {Object.values(groupedBookings).map((booking, index) => {
            const totalAmount = getBoxPrice(booking.boxId) * booking.slots.length;
            const isPast = new Date(booking.date) < new Date(new Date().toDateString());
            
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className={`${isPast ? 'bg-gray-100' : 'bg-primary-50'} px-6 py-4 border-b`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {getBoxName(booking.boxId)}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {formatDate(booking.date)}
                      </p>
                    </div>
                    <span
                      className={`${
                        isPast
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-green-100 text-green-800'
                      } px-4 py-2 rounded-full text-sm font-semibold`}
                    >
                      {isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Booking Details
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Customer:</span>{' '}
                          {booking.customerName}
                        </p>
                        <p>
                          <span className="font-medium">Box:</span>{' '}
                          {getBoxName(booking.boxId)}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{' '}
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Time Slots ({booking.slots.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.slots.sort((a, b) => a - b).map((slotId) => (
                          <span
                            key={slotId}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium"
                          >
                            {getTimeSlotDisplay(slotId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.slots.length} hour{booking.slots.length > 1 ? 's' : ''} × {formatCurrency(getBoxPrice(booking.boxId))}/hr
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/booking"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Book Another Session
          </Link>
        </div>
      </div>
    </div>
  );
}

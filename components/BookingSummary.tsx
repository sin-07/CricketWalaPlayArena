'use client';

import React from 'react';
import { Booking } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { TIME_SLOTS } from '@/utils/dummyData';

interface BookingSummaryProps {
  booking: Booking | null;
  onClose: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const getTimeSlotDisplay = (slotId: number): string => {
    const slot = TIME_SLOTS.find(s => s.id === `slot-${slotId}`);
    return slot ? slot.display : slotId.toString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[100vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-600 text-white p-4 sm:p-6 rounded-t-none sm:rounded-t-xl">\n
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-primary-100 mt-1">Your Cricket Wala Play Arena slot has been reserved</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-primary-700 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Reference */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-xl font-bold text-gray-900">{booking.bookingRef}</p>
          </div>

          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Details</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Name:</span> {booking.customerName}</p>
              <p><span className="font-medium">Email:</span> {booking.email}</p>
              <p><span className="font-medium">Phone:</span> {booking.phone}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Details</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Arena Slot:</span> {booking.boxName}</p>
              <p><span className="font-medium">Date:</span> {formatDate(booking.date)}</p>
              <p><span className="font-medium">Time Slots:</span></p>
              <div className="ml-4 space-y-1">
                {booking.timeSlotIds?.map((slotId) => (
                  <p key={slotId} className="text-sm">• {getTimeSlotDisplay(slotId)}</p>
                ))}
              </div>
              <p><span className="font-medium">Duration:</span> {booking.timeSlotIds?.length || 0} hour{(booking.timeSlotIds?.length || 0) > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Price per hour:</span>
                <span>{formatCurrency(booking.pricePerHour)}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of hours:</span>
                <span>{booking.timeSlotIds?.length || 0}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-600 border-t pt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Please arrive 10 minutes before your booking time</li>
              <li>Bring your booking reference number</li>
              <li>Cancellations must be made 24 hours in advance</li>
              <li>Payment can be made at the venue</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;

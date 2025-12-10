'use client';

import React from 'react';
import { CricketBox } from '@/types';
import { TIME_SLOTS } from '@/utils/dummyData';

interface SlotPickerProps {
  selectedDate: string;
  selectedBox: CricketBox | null;
  selectedSlots: string[];
  onSlotToggle: (slotId: string) => void;
  unavailableSlots: string[];
  bookedSlotsDetails?: Array<{ 
    timeSlotId: number; 
    customerName: string; 
    email: string;
    phone: string;
    bookingRef: string;
    timeSlotIds?: number[];
  }>;
  currentUserEmail?: string;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ 
  selectedDate, 
  selectedBox, 
  selectedSlots, 
  onSlotToggle, 
  unavailableSlots,
  bookedSlotsDetails = [],
  currentUserEmail
}) => {
  const isSlotUnavailable = (slotId: string): boolean => {
    return unavailableSlots.includes(slotId);
  };

  const isSlotSelected = (slotId: string): boolean => {
    return selectedSlots.includes(slotId);
  };

  const getBookingDetails = (slotId: string) => {
    const slotNumber = parseInt(slotId.replace('slot-', ''));
    const booking = bookedSlotsDetails.find(b => 
      b.timeSlotId === slotNumber || (b.timeSlotIds && b.timeSlotIds.includes(slotNumber))
    );
    
    if (!booking) return null;
    
    const isCurrentUser = currentUserEmail && booking.email === currentUserEmail;
    
    // Find the time range for this booking
    if (booking.timeSlotIds && booking.timeSlotIds.length > 1) {
      const sortedSlots = [...booking.timeSlotIds].sort((a, b) => a - b);
      const startSlot = TIME_SLOTS.find(s => s.id === `slot-${sortedSlots[0]}`);
      const endSlot = TIME_SLOTS.find(s => s.id === `slot-${sortedSlots[sortedSlots.length - 1]}`);
      
      if (startSlot && endSlot) {
        return {
          customerName: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          bookingRef: booking.bookingRef,
          timeRange: `${startSlot.startTime} - ${endSlot.endTime}`,
          slotCount: booking.timeSlotIds.length,
          isCurrentUser
        };
      }
    }
    
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    return {
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      bookingRef: booking.bookingRef,
      timeRange: slot?.display || '',
      slotCount: 1,
      isCurrentUser
    };
  };

  const getSlotButtonClass = (slotId: string): string => {
    if (isSlotUnavailable(slotId)) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    if (isSlotSelected(slotId)) {
      return 'bg-primary-600 text-white border-primary-600 shadow-md';
    }
    return 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:text-primary-600';
  };

  return (
    <div className="h-full">
      <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">
        Select Time Slots
      </h3>
      
      {selectedBox && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Selected Box:</span> {selectedBox.name} - ₹{selectedBox.pricePerHour}/hour
          </p>
        </div>
      )}

      <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 ${!selectedBox ? 'opacity-50 pointer-events-none' : ''}`}>
        {TIME_SLOTS.map((slot) => {
          const bookingDetails = getBookingDetails(slot.id);
          const isUnavailable = isSlotUnavailable(slot.id);
          
          return (
            <div key={slot.id} className="relative group">
              <button
                onClick={() => selectedBox && onSlotToggle(slot.id)}
                disabled={!selectedBox || isUnavailable}
                className={`${getSlotButtonClass(
                  slot.id
                )} border-2 px-2 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 w-full`}
              >
                {slot.display}
              </button>
              
              {/* Tooltip for booked slots */}
              {isUnavailable && bookingDetails && (
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 ${
                  bookingDetails.isCurrentUser ? 'bg-green-700' : 'bg-red-600'
                } text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 min-w-[200px]`}>
                  {bookingDetails.isCurrentUser ? (
                    <>
                      <div className="font-semibold mb-1 text-green-200">✓ Your Booking</div>
                      <div className="mb-1">🕐 {bookingDetails.timeRange}</div>
                      <div className="text-green-200 text-[10px] border-t border-green-500 pt-1 mt-1">
                        <div>Ref: {bookingDetails.bookingRef}</div>
                        <div>Name: {bookingDetails.customerName}</div>
                        <div>Phone: {bookingDetails.phone}</div>
                        <div>Slots: {bookingDetails.slotCount}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold mb-1">🔒 Already Booked</div>
                      <div className="text-red-100">This slot is unavailable</div>
                      <div className="text-red-200 text-[10px] mt-1">
                        {bookingDetails.slotCount} slot{bookingDetails.slotCount > 1 ? 's' : ''} booked by another user
                      </div>
                    </>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className={`w-2 h-2 ${
                      bookingDetails.isCurrentUser ? 'bg-green-700' : 'bg-red-600'
                    } transform rotate-45`}></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded mr-1"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-600 rounded mr-1"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
          <span className="text-gray-600">Booked</span>
        </div>
      </div>

      {selectedBox && selectedSlots.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-semibold text-green-800">
            {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
          </p>
          <p className="text-lg font-bold text-green-900 mt-1">
            Total: ₹{selectedBox.pricePerHour * selectedSlots.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;

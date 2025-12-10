'use client';

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  id: number;
  time: string;
  label: string;
  isBooked: boolean;
  isPast?: boolean;
}

interface TimeSlotSelectorProps {
  selectedDate: string;
  selectedSlots: number[];
  bookedSlots: number[];
  onSlotToggle: (slotId: number) => void;
  isAdmin?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDate,
  selectedSlots,
  bookedSlots,
  onSlotToggle,
  isAdmin = false,
}) => {
  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    const currentHour = new Date().getHours();

    for (let hour = 6; hour <= 23; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Check if this slot is in the past (only for today)
      const isPast = isToday && hour <= currentHour;
      
      // Hide past slots for regular users on current day
      if (!isAdmin && isPast) {
        continue;
      }

      slots.push({
        id: hour,
        time: startTime,
        label: `${startTime} - ${endTime}`,
        isBooked: bookedSlots.includes(hour),
        isPast,
      });
    }

    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [selectedDate, bookedSlots, isAdmin]);

  const getSlotStyle = (slot: TimeSlot) => {
    if (slot.isBooked) {
      if (isAdmin) {
        // Admin can still select booked slots, but they're visually marked
        if (selectedSlots.includes(slot.id)) {
          return 'bg-primary-600 border-primary-600 text-white shadow-lg scale-105';
        }
        return 'bg-orange-100 border-orange-400 text-orange-800 hover:border-orange-500 hover:bg-orange-200';
      }
      // Regular users cannot select booked slots
      return 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-75';
    }
    if (slot.isPast && isAdmin && !slot.isBooked) {
      return 'bg-gray-100 border-gray-300 text-gray-500';
    }
    if (selectedSlots.includes(slot.id)) {
      return 'bg-primary-600 border-primary-600 text-white shadow-lg scale-105';
    }
    return 'bg-white border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-primary-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full"
    >
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <Clock className="inline-block w-4 h-4 mr-2" />
        Select Time Slots
      </label>

      {timeSlots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No available time slots for today.</p>
          <p className="text-sm mt-1">Please select a future date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {timeSlots.map((slot, index) => (
              <motion.button
                key={slot.id}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                whileHover={{ scale: slot.isBooked && !isAdmin ? 1 : 1.05 }}
                whileTap={{ scale: slot.isBooked && !isAdmin ? 1 : 0.95 }}
                onClick={() => {
                  if (!slot.isBooked || isAdmin) {
                    onSlotToggle(slot.id);
                  }
                }}
                disabled={slot.isBooked && !isAdmin}
                className={cn(
                  'relative px-3 py-4 border-2 rounded-lg text-sm font-medium min-h-[70px]',
                  'transition-all duration-200',
                  getSlotStyle(slot)
                )}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="font-medium text-center leading-tight">{slot.label}</span>
                  {slot.isBooked && (
                    <span className="text-xs mt-1 opacity-75">
                      {isAdmin ? '(Booked)' : 'Booked'}
                    </span>
                  )}
                  {slot.isPast && isAdmin && !slot.isBooked && (
                    <span className="text-xs mt-1 opacity-75">Past</span>
                  )}
                </div>
                {selectedSlots.includes(slot.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap gap-4 text-xs"
      >
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-primary-600 border-2 border-primary-600 rounded mr-2"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        {isAdmin ? (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-400 rounded mr-2"></div>
            <span className="text-gray-600">Booked (can override)</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></div>
            <span className="text-gray-600">Booked</span>
          </div>
        )}
      </motion.div>

      {selectedSlots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm font-semibold text-green-800">
            {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TimeSlotSelector;

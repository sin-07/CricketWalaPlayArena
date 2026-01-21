'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Check } from 'lucide-react';

interface Slot {
  slot: string;
  available: boolean;
  isBooked?: boolean;
  isFrozen?: boolean;
}

interface SlotSelectorProps {
  date: string;
  sport: string;
  bookingType?: 'match' | 'practice';
  selectedSlots: string[];
  onSlotChange: (slots: string[]) => void;
  loading?: boolean;
}

export default function SlotSelector({
  date,
  sport,
  bookingType = 'practice',
  selectedSlots,
  onSlotChange,
  loading = false,
}: SlotSelectorProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Store onSlotChange in a ref to avoid triggering useEffect
  const onSlotChangeRef = React.useRef(onSlotChange);
  onSlotChangeRef.current = onSlotChange;

  useEffect(() => {
    if (!date || !sport) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/turf-bookings/slots?date=${date}&sport=${encodeURIComponent(sport)}&bookingType=${bookingType}`
        );
        const data = await response.json();

        if (data.success) {
          let availableSlots = data.data.slots;

          // Filter out past time slots for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);

          if (selectedDate.getTime() === today.getTime()) {
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            availableSlots = availableSlots.filter((slot: Slot) => {
              const [startTime] = slot.slot.split('-');
              const [slotHour, slotMinute] = startTime.split(':').map(Number);
              const slotTimeInMinutes = slotHour * 60 + slotMinute;
              return slotTimeInMinutes >= currentTimeInMinutes;
            });
          }

          setSlots(availableSlots);
        } else {
          setError(data.message);
        }
      } catch (err: any) {
        setError('Failed to fetch available slots');
        console.error('Error fetching slots:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [date, sport, bookingType]); // Only depend on date, sport, bookingType - NOT selectedSlot or onSlotChange

  const availableSlots = slots.filter((s) => s.available);

  const handleSlotToggle = (slot: string) => {
    const isSelected = selectedSlots.includes(slot);
    if (isSelected) {
      // Remove slot from selection
      onSlotChange(selectedSlots.filter(s => s !== slot));
    } else {
      // Add slot to selection
      onSlotChange([...selectedSlots, slot]);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700">
        <Clock className="inline-block w-4 h-4 mr-1" />
        Select Time Slot <span className="text-red-500">*</span>
      </label>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      {/* Custom Animated Dropdown */}
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => !isLoading && !loading && availableSlots.length > 0 && setIsOpen(!isOpen)}
          disabled={isLoading || loading || availableSlots.length === 0}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-left flex items-center justify-between"
          whileTap={{ scale: 0.98 }}
        >
          <span className={selectedSlots.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
            {isLoading 
              ? 'Loading slots...' 
              : selectedSlots.length > 0 
                ? `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected: ${selectedSlots.join(', ')}`
                : 'Choose time slots'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && availableSlots.length > 0 && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
              >
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedSlots.includes(slot.slot);
                  return (
                    <motion.button
                      key={slot.slot}
                      type="button"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04, ease: "easeOut" }}
                      onClick={() => handleSlotToggle(slot.slot)}
                      className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center justify-between group ${
                        isSelected ? 'bg-green-100 text-green-700 border-l-4 border-green-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                        {slot.slot}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-5 h-5 text-green-600" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {!isLoading && (
        <div className="text-sm text-gray-500 space-y-1">
          <p>{availableSlots.length} of {slots.length} slots available</p>
          {slots.filter(s => s.isFrozen).length > 0 && (
            <p className="text-red-600 text-xs">
              ({slots.filter(s => s.isFrozen).length} frozen slots hidden)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

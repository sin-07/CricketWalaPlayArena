'use client';

import React, { useState, useEffect } from 'react';

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
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  loading?: boolean;
}

export default function SlotSelector({
  date,
  sport,
  bookingType = 'practice',
  selectedSlot,
  onSlotChange,
  loading = false,
}: SlotSelectorProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          // Reset selected slot if it's no longer available
          if (selectedSlot && !availableSlots.find((s: Slot) => s.slot === selectedSlot && s.available)) {
            onSlotChange('');
          }
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
  }, [date, sport, bookingType, selectedSlot, onSlotChange]);

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Time Slot <span className="text-red-500">*</span>
      </label>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <select
        value={selectedSlot}
        onChange={(e) => onSlotChange(e.target.value)}
        disabled={isLoading || loading || availableSlots.length === 0}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">
          {isLoading ? 'Loading slots...' : 'Choose a time slot'}
        </option>
        {availableSlots.length === 0 && !isLoading && (
          <option disabled>No available slots for this date</option>
        )}
        {availableSlots.map((slot) => (
          <option key={slot.slot} value={slot.slot}>
            {slot.slot}
          </option>
        ))}
      </select>
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

'use client';

import React, { useMemo } from 'react';
import { getMinDate, getMaxDate } from '@/lib/bookingValidation';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DatePickerComponent({
  selectedDate,
  onDateChange,
}: DatePickerProps) {
  // Memoize min and max dates since they don't change often
  const minDate = useMemo(() => getMinDate(), []);
  const maxDate = useMemo(() => getMaxDate(), []);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      />
    </div>
  );
}

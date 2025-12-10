'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Calendar className="inline-block w-4 h-4 mr-2" />
        Select Date
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg",
          "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "transition-all duration-200",
          "text-gray-900 bg-white"
        )}
      />
    </motion.div>
  );
};

export default DatePickerComponent;

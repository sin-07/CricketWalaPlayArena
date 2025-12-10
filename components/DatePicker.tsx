'use client';

import React from 'react';
import { getNext14Days } from '@/utils/helpers';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  const days = getNext14Days();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Date</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === new Date().toISOString().split('T')[0];

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(day.date)}
              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary-600 bg-primary-600 text-white shadow-md scale-105'
                  : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <div className="text-center">
                <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                  {day.dayName}
                </div>
                <div className={`text-lg font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                  {day.display.split(' ')[1]}
                </div>
                <div className={`text-xs ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                  {day.display.split(' ')[0]}
                </div>
              </div>
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;

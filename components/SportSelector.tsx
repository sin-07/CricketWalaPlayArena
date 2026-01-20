'use client';

import React from 'react';
import { MATCH_SPORTS, PRACTICE_SPORTS } from '@/lib/bookingValidation';

interface SportSelectorProps {
  bookingType: 'match' | 'practice';
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

export default function SportSelector({
  bookingType,
  selectedSport,
  onSportChange,
}: SportSelectorProps) {
  const sports = bookingType === 'match' ? MATCH_SPORTS : PRACTICE_SPORTS;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Sport <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedSport}
        onChange={(e) => onSportChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
      >
        <option value="">Choose a sport</option>
        {sports.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
    </div>
  );
}

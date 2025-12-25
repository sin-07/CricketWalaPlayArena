'use client';

import React, { useEffect, useState } from 'react';
import { TimeSlot } from '@/types';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

interface SlotStatusProps {
  boxId: number;
  date: string;
  onSlotsUpdate?: (bookedSlots: number[]) => void;
}

interface SlotAvailabilityData {
  date: string;
  boxId: number;
  bookedSlots: number[];
  nextAvailableSlot: TimeSlot | null;
  totalBooked: number;
  totalAvailable: number;
}

const SlotStatus: React.FC<SlotStatusProps> = ({ boxId, date, onSlotsUpdate }) => {
  const [slotData, setSlotData] = useState<SlotAvailabilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlotStatus = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/bookings/slots?boxId=${boxId}&date=${date}`);
      const result = await response.json();

      if (result.success) {
        setSlotData(result.data);
        if (onSlotsUpdate) {
          onSlotsUpdate(result.data.bookedSlots);
        }
      } else {
        setError(result.error || 'Failed to fetch slot status');
      }
    } catch (err) {
      setError('Failed to load slot availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boxId && date) {
      setLoading(true);
      fetchSlotStatus();

      // Poll for updates every 10 seconds for real-time updates
      const interval = setInterval(fetchSlotStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [boxId, date]);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700">Checking slot availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">⚠️ {error}</p>
      </div>
    );
  }

  if (!slotData) return null;

  return (
    <div className="space-y-4">
      {/* Availability Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Slot Availability Overview
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Available Slots</div>
            <div className="text-2xl font-bold text-green-600">{slotData.totalAvailable}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Booked Slots</div>
            <div className="text-2xl font-bold text-red-600">{slotData.totalBooked}</div>
          </div>
        </div>
      </div>

      {/* Next Available Slot */}
      {slotData.nextAvailableSlot ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <FaCheckCircle className="mr-2 text-green-600" />
            Next Available Slot
          </h4>
          <div className="bg-white rounded-lg p-3 border border-green-300">
            <div className="text-lg font-bold text-green-700">
              {slotData.nextAvailableSlot.label}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              This slot is available for booking
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
            <span className="mr-2">⚠️</span>
            All Slots Booked
          </h4>
          <p className="text-sm text-yellow-700">
            All time slots for this date are currently booked. Please select a different date.
          </p>
        </div>
      )}

      {/* Booked Slots Info */}
      {slotData.bookedSlots.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <FaLock className="mr-2 text-red-600" />
            Currently Booked Slots
          </h4>
          <div className="flex flex-wrap gap-2">
            {slotData.bookedSlots.map((slotId) => {
              const startTime = `${slotId.toString().padStart(2, '0')}:00`;
              const endTime = `${(slotId + 1).toString().padStart(2, '0')}:00`;
              return (
                <div
                  key={slotId}
                  className="bg-white border border-orange-300 rounded px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {startTime} - {endTime}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            ℹ️ These slots are already booked by other users and cannot be selected.
          </p>
        </div>
      )}

      {/* Real-time Update Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live updates active</span>
      </div>
    </div>
  );
};

export default SlotStatus;

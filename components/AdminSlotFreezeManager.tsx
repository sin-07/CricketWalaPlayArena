'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface FrozenSlot {
  _id: string;
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string;
  slot: string;
  isFrozen: boolean;
  frozenBy?: string;
  frozenAt?: string;
}

interface SlotFilterParams {
  bookingType: 'match' | 'practice';
  sports: string[]; // Multiple sports
  date: string;
  slots: string[]; // Multiple slots
}

export default function AdminSlotFreezeManager() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [frozenSlots, setFrozenSlots] = useState<FrozenSlot[]>([]);

  // Form state for freezing slots
  const [freezeForm, setFreezeForm] = useState<SlotFilterParams>({
    bookingType: 'match',
    sports: ['Cricket'], // Multiple sports with default
    date: new Date().toISOString().split('T')[0],
    slots: ['06:00-07:00'], // Multiple slots with default
  });

  // Filter state for viewing frozen slots
  const [filterParams, setFilterParams] = useState({
    bookingType: '',
    sport: '',
    date: '',
  });

  const availableSlots = [
    '00:00-01:00',
    '01:00-02:00',
    '02:00-03:00',
    '03:00-04:00',
    '04:00-05:00',
    '05:00-06:00',
    '06:00-07:00',
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00',
    '22:00-23:00',
    '23:00-00:00',
  ];

  const sports = ['Cricket', 'Football', 'Badminton'];
  const bookingTypes = ['match', 'practice'];

  // Fetch frozen slots
  useEffect(() => {
    fetchFrozenSlots();
  }, [filterParams]);

  const fetchFrozenSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterParams.bookingType) params.append('bookingType', filterParams.bookingType);
      if (filterParams.sport) params.append('sport', filterParams.sport);
      if (filterParams.date) params.append('date', filterParams.date);

      const response = await fetch(`/api/admin/slots/get-frozen?${params}`);
      const data = await response.json();

      if (data.success) {
        setFrozenSlots(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch frozen slots' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error fetching frozen slots' });
    } finally {
      setLoading(false);
    }
  };

  const handleSportToggle = (sport: string) => {
    setFreezeForm((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleSlotToggle = (slot: string) => {
    setFreezeForm((prev) => ({
      ...prev,
      slots: prev.slots.includes(slot)
        ? prev.slots.filter((s) => s !== slot)
        : [...prev.slots, slot],
    }));
  };

  const handleFreezeBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!freezeForm.date) {
      setMessage({ type: 'error', text: 'Please select a date' });
      return;
    }

    if (freezeForm.sports.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one sport' });
      return;
    }

    if (freezeForm.slots.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one slot' });
      return;
    }

    try {
      setLoading(true);

      // Freeze each combination of sport and slot
      const freezePromises = freezeForm.sports.flatMap((sport) =>
        freezeForm.slots.map((slot) =>
          fetch('/api/admin/slots/freeze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingType: freezeForm.bookingType,
              sport,
              date: freezeForm.date,
              slot,
            }),
            credentials: 'include',
          })
        )
      );

      const responses = await Promise.all(freezePromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      if (successCount > 0) {
        setMessage({
          type: 'success',
          text: `${successCount} slot(s) frozen successfully${failureCount > 0 ? ` (${failureCount} already frozen)` : ''}`,
        });
        setFreezeForm({
          bookingType: 'match',
          sports: ['Cricket'],
          date: new Date().toISOString().split('T')[0],
          slots: ['06:00-07:00'],
        });
        setTimeout(() => fetchFrozenSlots(), 500);
      } else {
        setMessage({ type: 'error', text: 'Failed to freeze slots' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error freezing slots' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreezeSlot = async (frozenSlot: FrozenSlot) => {
    if (
      !confirm(
        `Are you sure you want to unfreeze the slot ${frozenSlot.slot} for ${frozenSlot.sport} on ${frozenSlot.date}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/slots/unfreeze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingType: frozenSlot.bookingType,
          sport: frozenSlot.sport,
          date: frozenSlot.date,
          slot: frozenSlot.slot,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => fetchFrozenSlots(), 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to unfreeze slot' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error unfreezing slot' });
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Slot Freeze Manager</h1>
        <p className="text-gray-600">Freeze multiple slots across multiple sports at once</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Freeze Slots Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Freeze Multiple Slots</h2>

          <form onSubmit={handleFreezeBulk} className="space-y-6">
            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
              <select
                value={freezeForm.bookingType}
                onChange={(e) =>
                  setFreezeForm({
                    ...freezeForm,
                    bookingType: e.target.value as 'match' | 'practice',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bookingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sports Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Sports (Multiple)
              </label>
              <div className="space-y-2 border border-gray-300 rounded-lg p-3 bg-gray-50">
                {sports.map((sport) => (
                  <div key={sport} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`sport-${sport}`}
                      checked={freezeForm.sports.includes(sport)}
                      onChange={() => handleSportToggle(sport)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`sport-${sport}`}
                      className="ml-2 text-sm text-gray-700 cursor-pointer font-medium"
                    >
                      {sport}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Selected: {freezeForm.sports.length} sport(s)
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <Input
                type="date"
                value={freezeForm.date}
                onChange={(e) =>
                  setFreezeForm({
                    ...freezeForm,
                    date: e.target.value,
                  })
                }
                min={getMinDate()}
                required
                className="w-full"
              />
            </div>

            {/* Slots Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Time Slots (Multiple)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <div key={slot} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`slot-${slot}`}
                        checked={freezeForm.slots.includes(slot)}
                        onChange={() => handleSlotToggle(slot)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label
                        htmlFor={`slot-${slot}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {slot}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Selected: {freezeForm.slots.length} slot(s)
              </p>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Summary:</strong> Will freeze{' '}
                <strong>{freezeForm.sports.length * freezeForm.slots.length}</strong> slot
                combination(s) ({freezeForm.sports.length} sport(s) × {freezeForm.slots.length}{' '}
                slot(s)) on <strong>{freezeForm.date}</strong>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {loading
                ? 'Processing...'
                : `Freeze ${freezeForm.sports.length * freezeForm.slots.length} Slot(s)`}
            </Button>
          </form>
        </Card>

        {/* Filter and View Frozen Slots */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Filter Frozen Slots</h2>

          <div className="space-y-4 mb-6">
            {/* Filter Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
              <select
                value={filterParams.bookingType}
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    bookingType: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {bookingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Sport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
              <select
                value={filterParams.sport}
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    sport: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <Input
                type="date"
                value={filterParams.date}
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    date: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Total frozen slots: <strong>{frozenSlots.length}</strong>
          </p>
        </Card>
      </div>

      {/* Frozen Slots List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frozen Slots List</h2>

        {frozenSlots.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <p>No frozen slots found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frozenSlots.map((slot) => (
              <Card key={slot._id} className="p-4 border-2 border-red-200 bg-red-50">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{slot.sport}</p>
                      <p className="text-sm text-gray-600">
                        {slot.bookingType.charAt(0).toUpperCase() + slot.bookingType.slice(1)}
                      </p>
                    </div>
                    <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                      Frozen
                    </span>
                  </div>

                  <div className="border-t border-red-200 pt-2">
                    <p className="text-sm font-medium text-gray-700">{slot.date}</p>
                    <p className="text-sm font-medium text-gray-700">{slot.slot}</p>
                  </div>

                  {slot.frozenBy && (
                    <p className="text-xs text-gray-600">
                      Frozen by: <strong>{slot.frozenBy}</strong>
                    </p>
                  )}

                  {slot.frozenAt && (
                    <p className="text-xs text-gray-600">
                      At: {new Date(slot.frozenAt).toLocaleString()}
                    </p>
                  )}

                  <Button
                    onClick={() => handleUnfreezeSlot(slot)}
                    disabled={loading}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                  >
                    Unfreeze
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

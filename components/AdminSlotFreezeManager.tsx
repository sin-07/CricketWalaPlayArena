'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Snowflake, 
  Calendar, 
  Clock, 
  Filter, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Trophy,
  Target,
  RefreshCw
} from 'lucide-react';
import { GiCricketBat, GiSoccerBall, GiShuttlecock } from 'react-icons/gi';

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
    sports: [], // Start empty - no default selection
    date: new Date().toISOString().split('T')[0],
    slots: [], // Start empty - no default selection
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
  const bookingTypes = ['match']; // Only match bookings can be frozen

  // Get current hour to filter past slots for today
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Filter available slots based on selected date
  const getFilteredSlots = () => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = freezeForm.date === today;
    
    if (!isToday) {
      return availableSlots; // Show all slots for future dates
    }
    
    // For today, filter out past time slots
    const currentHour = getCurrentHour();
    return availableSlots.filter(slot => {
      const slotStartHour = parseInt(slot.split(':')[0]);
      return slotStartHour > currentHour; // Only show future slots
    });
  };

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
          sports: [], // Reset to empty
          date: new Date().toISOString().split('T')[0],
          slots: [], // Reset to empty
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 pt-10 md:pt-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Snowflake className="w-7 h-7 text-green-600" />
                  Slot Freeze Manager
                </h1>
                <p className="text-sm text-gray-500">Freeze multiple slots across multiple sports at once</p>
              </div>
            </div>
            <button
              onClick={() => fetchFrozenSlots()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Frozen</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{frozenSlots.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Snowflake className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Match Slots</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {frozenSlots.filter(s => s.bookingType === 'match').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">To Freeze</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {freezeForm.sports.length * freezeForm.slots.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Freeze Slots Section */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Freeze Multiple Slots</h2>
                <p className="text-sm text-gray-500">Select sports, date, and time slots</p>
              </div>
            </div>

            <form onSubmit={handleFreezeBulk} className="space-y-6">
              {/* Booking Type - Hidden since only match is available */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Match Bookings Only</p>
                  <p className="text-xs text-green-700">Only match slots can be frozen</p>
                </div>
              </div>

              {/* Sports Multi-Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Sports
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportToggle(sport)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                        freezeForm.sports.includes(sport)
                          ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sport === 'Cricket' ? <GiCricketBat className="w-4 h-4" /> : sport === 'Football' ? <GiSoccerBall className="w-4 h-4" /> : <GiShuttlecock className="w-4 h-4" />} {sport}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {freezeForm.sports.length} sport(s) selected
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <Input
                  type="date"
                  value={freezeForm.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setFreezeForm({
                      ...freezeForm,
                      date: newDate,
                      slots: [], // Clear slot selections when date changes
                    });
                  }}
                  min={getMinDate()}
                  required
                  className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Slots Multi-Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time Slots
                  {freezeForm.date === new Date().toISOString().split('T')[0] && (
                    <span className="text-xs text-orange-600 font-normal">(Past slots hidden for today)</span>
                  )}
                </label>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 max-h-52 overflow-y-auto">
                  {getFilteredSlots().length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No available slots for today. Select a future date.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getFilteredSlots().map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotToggle(slot)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            freezeForm.slots.includes(slot)
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {freezeForm.slots.length} slot(s) selected
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900">
                  <strong>Summary:</strong> Will freeze{' '}
                  <span className="text-lg font-bold text-green-600">
                    {freezeForm.sports.length * freezeForm.slots.length}
                  </span>{' '}
                  slot combination(s)
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {freezeForm.sports.length} sport(s) × {freezeForm.slots.length} slot(s) on {freezeForm.date}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || freezeForm.sports.length === 0 || freezeForm.slots.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Snowflake className="w-4 h-4" />
                    Freeze {freezeForm.sports.length * freezeForm.slots.length} Slot(s)
                  </span>
                )}
              </Button>
            </form>
          </Card>

          {/* Filter and View Frozen Slots */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filter Frozen Slots</h2>
                <p className="text-sm text-gray-500">Filter by type, sport, or date</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Filter Booking Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Type</label>
                <select
                  value={filterParams.bookingType}
                  onChange={(e) =>
                    setFilterParams({
                      ...filterParams,
                      bookingType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sport</label>
              <select
                value={filterParams.sport}
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    sport: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <Input
                type="date"
                value={filterParams.date}
                onChange={(e) =>
                  setFilterParams({
                    ...filterParams,
                    date: e.target.value,
                  })
                }
                className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            {/* Clear Filters */}
            <button
              type="button"
              onClick={() => setFilterParams({ bookingType: '', sport: '', date: '' })}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-900">
              Total frozen slots: <span className="text-lg font-bold text-green-600">{frozenSlots.length}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Frozen Slots List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Frozen Slots List</h2>
              <p className="text-sm text-gray-500">
                {frozenSlots.length} slot(s) currently frozen
              </p>
            </div>
          </div>
        </div>

        {frozenSlots.length === 0 ? (
          <Card className="p-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Snowflake className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No frozen slots found</p>
            <p className="text-sm text-gray-400 mt-1">Freeze some slots to see them here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {frozenSlots.map((slot) => (
              <Card key={slot._id} className="p-5 bg-white rounded-2xl shadow-sm border border-red-100 hover:shadow-lg hover:border-red-200 transition-all group">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {slot.sport === 'Cricket' ? <GiCricketBat className="w-6 h-6 text-green-600" /> : slot.sport === 'Football' ? <GiSoccerBall className="w-6 h-6 text-blue-600" /> : <GiShuttlecock className="w-6 h-6 text-purple-600" />}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">{slot.sport}</p>
                        <p className="text-xs text-gray-500 capitalize">{slot.bookingType}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                      <Snowflake className="w-3 h-3" />
                      Frozen
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{slot.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{slot.slot}</span>
                    </div>
                  </div>

                  {(slot.frozenBy || slot.frozenAt) && (
                    <div className="text-xs text-gray-400 space-y-1">
                      {slot.frozenBy && <p>By: {slot.frozenBy}</p>}
                      {slot.frozenAt && <p>At: {new Date(slot.frozenAt).toLocaleString()}</p>}
                    </div>
                  )}

                  <Button
                    onClick={() => handleUnfreezeSlot(slot)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-green-100 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Unlock className="w-4 h-4" />
                      Unfreeze
                    </span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

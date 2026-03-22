'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw, User, Phone } from 'lucide-react';
import { GiCricketBat, GiSoccerBall } from 'react-icons/gi';
import { MdSportsTennis } from 'react-icons/md';

interface SlotInfo {
  slot: string;
  status: 'available' | 'booked' | 'frozen';
  sport: string | null;
  bookerName: string | null;
  bookerMobile: string | null;
}

interface OverviewData {
  date: string;
  match: SlotInfo[];
  practice: SlotInfo[];
}

const SPORT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Cricket: {
    label: 'Cricket',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: <GiCricketBat className="w-3.5 h-3.5" />,
  },
  Football: {
    label: 'Football',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    icon: <GiSoccerBall className="w-3.5 h-3.5" />,
  },
  Badminton: {
    label: 'Badminton',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    icon: <MdSportsTennis className="w-3.5 h-3.5" />,
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getToday() {
  return toLocalDateStr(new Date());
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

export default function AdminSlotOverview() {
  const [date, setDate] = useState(getToday);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'match' | 'practice'>('match');
  const gridRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const dateTextRef = useRef<HTMLDivElement>(null);

  const handleSlotEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const detail = card.querySelector('[data-hover-detail]') as HTMLElement | null;
    if (!detail) return;
    gsap.killTweensOf(detail);
    gsap.to(detail, {
      height: 'auto', opacity: 1, duration: 0.25, ease: 'power2.out', force3D: true, overwrite: true,
    });
  }, []);

  const handleSlotLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const detail = card.querySelector('[data-hover-detail]') as HTMLElement | null;
    if (!detail) return;
    gsap.killTweensOf(detail);
    gsap.to(detail, {
      height: 0, opacity: 0, duration: 0.2, ease: 'power2.in', force3D: true, overwrite: true,
    });
  }, []);

  // Animate date change: date text slides, grid exits then enters on data load
  const changeDate = useCallback((newDate: string) => {
    if (newDate === date) return;
    const direction = newDate > date ? 1 : -1;

    // Animate date text with vertical slide
    if (dateTextRef.current) {
      gsap.fromTo(dateTextRef.current,
        { y: direction * 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Quickly fade out grid wrapper
    if (gridWrapperRef.current) {
      gsap.set(gridWrapperRef.current, { opacity: 0, x: direction * -30 });
    }

    // Always update date immediately
    setDate(newDate);
  }, [date]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/turf-bookings/slot-overview?date=${date}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // GSAP: animate grid wrapper + slot cards when data loads or type changes
  useEffect(() => {
    if (loading || !gridRef.current) return;

    // Reset wrapper position (it may have been animated out)
    if (gridWrapperRef.current) {
      gsap.fromTo(gridWrapperRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }

    const cards = gridRef.current.querySelectorAll('[data-slot-card]');
    if (!cards.length) return;
    gsap.fromTo(cards,
      { opacity: 0, y: 15, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.02, ease: 'power2.out', force3D: true }
    );
  }, [loading, data, activeType]);

  // GSAP: header bar entrance
  useEffect(() => {
    if (!headerBarRef.current) return;
    gsap.fromTo(headerBarRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const slots = data ? (activeType === 'match' ? data.match : data.practice) : [];
  const bookedCount = slots.filter(s => s.status === 'booked').length;
  const availableCount = slots.filter(s => s.status === 'available').length;
  const frozenCount = slots.filter(s => s.status === 'frozen').length;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div ref={headerBarRef} className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold">Today&apos;s Slot Overview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(addDays(date, -1))}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div ref={dateTextRef} className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(date)}
            </div>
            <button
              onClick={() => changeDate(addDays(date, 1))}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => changeDate(getToday())}
              className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={fetchOverview}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Turf Type Toggle */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveType('match')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeType === 'match'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Main Turf (Match)
          </button>
          <button
            onClick={() => setActiveType('practice')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeType === 'practice'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Practice Turf
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {availableCount} Available
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          {bookedCount} Booked
        </span>
        {frozenCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {frozenCount} Frozen
          </span>
        )}
      </div>

      {/* Slot Grid */}
      <div ref={gridWrapperRef} className="px-4 sm:px-6 pb-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {slots.map((s) => {
              const sportCfg = s.sport ? SPORT_CONFIG[s.sport] : null;
              const isBooked = s.status === 'booked';
              const isFrozen = s.status === 'frozen';
              const isAvailable = s.status === 'available';
              return (
                <div
                  key={s.slot}
                  data-slot-card
                  onMouseEnter={handleSlotEnter}
                  onMouseLeave={handleSlotLeave}
                  className={`relative rounded-lg border-2 p-2.5 transition-all cursor-default ${
                    isBooked
                      ? `${sportCfg?.bg || 'bg-red-50'} ${sportCfg?.border || 'border-red-300'}`
                      : isFrozen
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-green-50 border-green-200 hover:border-green-400'
                  }`}
                >
                  {/* Time */}
                  <div className={`text-xs font-bold mb-1 ${
                    isBooked ? (sportCfg?.color || 'text-red-700') : isFrozen ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {s.slot}
                  </div>

                  {/* Status */}
                  {isBooked && sportCfg && (
                    <div className="space-y-1">
                      <div className={`inline-flex items-center gap-1 text-xs font-semibold ${sportCfg.color}`}>
                        {sportCfg.icon}
                        {sportCfg.label}
                      </div>
                      {s.bookerName && (
                        <div className="text-[10px] text-gray-600 truncate flex items-center gap-0.5" title={s.bookerName}>
                          <User className="w-2.5 h-2.5 flex-shrink-0" />
                          {s.bookerName}
                        </div>
                      )}
                      {/* Detail revealed by GSAP on hover */}
                      {s.bookerMobile && (
                        <div
                          data-hover-detail
                          style={{ height: 0, opacity: 0, overflow: 'hidden' }}
                          className="text-[10px] text-gray-500 flex items-center gap-0.5"
                        >
                          <Phone className="w-2.5 h-2.5 flex-shrink-0" />
                          {s.bookerMobile}
                        </div>
                      )}
                    </div>
                  )}

                  {isFrozen && (
                    <div className="text-xs font-semibold text-blue-600">
                      Frozen
                      {s.sport && <span className="text-[10px] block text-blue-500">{s.sport}</span>}
                    </div>
                  )}

                  {isAvailable && (
                    <div className="text-xs font-medium text-green-600">Available</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="font-semibold text-gray-700">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300"></span>
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-300"></span>
          <GiCricketBat className="w-3 h-3 text-red-600" /> Cricket
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></span>
          <GiSoccerBall className="w-3 h-3 text-blue-700" /> Football
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></span>
          <MdSportsTennis className="w-3 h-3 text-purple-700" /> Badminton
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-50 border border-blue-300"></span>
          Frozen
        </span>
      </div>
    </div>
  );
}

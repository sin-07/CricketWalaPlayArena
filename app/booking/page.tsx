'use client';

import React, { useState } from 'react';
import TurfBookingForm from '@/components/TurfBookingForm';
import { GiCricketBat } from 'react-icons/gi';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'match' | 'practice'>('match');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GiCricketBat className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Turf Booking</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Book your cricket turf for Match or Practice sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('match')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'match'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
            }`}
          >
            🏏 Match
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'practice'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
            }`}
          >
            🎯 Practice
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {activeTab === 'match'
              ? 'Book a Match Session'
              : 'Book a Practice Session'}
          </h2>
          <TurfBookingForm bookingType={activeTab} />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Match Booking</h3>
            <p className="text-blue-800 text-sm">
              Book turf for competitive matches. Available sports: Cricket, Football, Badminton
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">
              Practice Booking
            </h3>
            <p className="text-purple-800 text-sm">
              Book turf for practice sessions. Available sports: Cricket, Badminton
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

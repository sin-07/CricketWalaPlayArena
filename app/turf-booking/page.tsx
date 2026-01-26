'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TurfBookingForm from '@/components/TurfBookingForm';
import { GiCricketBat } from 'react-icons/gi';
import { AnimatePresence, motion } from 'framer-motion';

export default function TurfBookingPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const initialTab = (typeParam === 'practice' || typeParam === 'match') ? typeParam : 'match';
  
  const [activeTab, setActiveTab] = useState<'match' | 'practice'>(initialTab);
  const [formKey, setFormKey] = useState(0); // Key to force form reset
  
  // Update tab when query param changes
  useEffect(() => {
    if (typeParam === 'practice' || typeParam === 'match') {
      if (typeParam !== activeTab) {
        setActiveTab(typeParam);
        setFormKey(prev => prev + 1);
      }
    }
  }, [typeParam]);

  const handleTabChange = (tab: 'match' | 'practice') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setFormKey(prev => prev + 1); // Increment key to reset form
    }
  };

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
            Book your cricket turf for Main Turf or Practice Turf sessions
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 relative">
          <button
            onClick={() => handleTabChange('match')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'match'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500 hover:scale-102'
            }`}
          >
            Main Turf
          </button>
          <button
            onClick={() => handleTabChange('practice')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'practice'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500 hover:scale-102'
            }`}
          >
            Practice Turf
          </button>
        </div>

        {/* Form Card with Slide Animation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: activeTab === 'match' ? -300 : 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: activeTab === 'match' ? 300 : -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {activeTab === 'match'
                  ? 'Book a Main Turf Session'
                  : 'Book a Practice Turf Session'}
              </h2>
              <TurfBookingForm key={formKey} bookingType={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Main Turf Booking</h3>
            <p className="text-blue-800 text-sm">
              Book turf for competitive matches. Available sports: Cricket, Football, Badminton
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">
              Practice Turf Booking
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

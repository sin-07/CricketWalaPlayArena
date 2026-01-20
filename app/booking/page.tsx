'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import TurfBookingForm from '@/components/TurfBookingForm';
import { GiCricketBat, GiSoccerBall } from 'react-icons/gi';
import { MdSportsCricket } from 'react-icons/md';
import { Calendar, Clock, Users, Star, Shield, Zap, Trophy, Target } from 'lucide-react';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'match' | 'practice'>('match');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const features = [
    { icon: Calendar, text: 'Easy Scheduling', color: 'text-blue-500' },
    { icon: Shield, text: 'Secure Booking', color: 'text-green-500' },
    { icon: Zap, text: 'Instant Confirmation', color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-300/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/40 to-cyan-300/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-lime-200/30 to-green-200/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 py-6 sm:py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 flex items-center justify-center">
                <GiCricketBat className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <motion.h1
                variants={itemVariants}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent text-center"
              >
                Book Your Turf
              </motion.h1>
            </motion.div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 md:mb-8">
            <div className="relative bg-white/60 backdrop-blur-md p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-lg border border-white/50">
              {/* Sliding Background */}
              <motion.div
                layoutId="activeTab"
                className="absolute inset-y-1 sm:inset-y-1.5 w-[calc(50%-4px)] sm:w-[calc(50%-6px)] bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg"
                animate={{
                  x: activeTab === 'match' ? 4 : 'calc(100% + 4px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              
              <div className="relative flex gap-1 sm:gap-1.5">
                <button
                  onClick={() => setActiveTab('match')}
                  className={`flex-1 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 ${
                    activeTab === 'match'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <span className="text-xs sm:text-sm md:text-base font-medium">Match</span>
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 ${
                    activeTab === 'practice'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <span className="text-xs sm:text-sm md:text-base font-medium">Practice</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-green-900/10 border border-white/50 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    {activeTab === 'match' ? (
                      <>
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        Book a Match Session
                      </>
                    ) : (
                      <>
                        <MdSportsCricket className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        Book a Practice Session
                      </>
                    )}
                  </h2>
                  <p className="text-green-100 text-xs sm:text-sm mt-1">
                    {activeTab === 'match'
                      ? 'Full turf booking for competitive games'
                      : 'Perfect for skill improvement & training'}
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-5 md:p-8">
                  <TurfBookingForm bookingType={activeTab} />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Info Cards */}
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-lg shadow-blue-900/5"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-base sm:text-lg mb-1">Match Booking</h3>
                  <p className="text-blue-700/80 text-xs sm:text-sm leading-relaxed">
                    Book for competitive matches. Available: Cricket, Football, Badminton
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 sm:p-6 border border-purple-100 shadow-lg shadow-purple-900/5"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 text-base sm:text-lg mb-1">Practice Booking</h3>
                  <p className="text-purple-700/80 text-xs sm:text-sm leading-relaxed">
                    Book for practice sessions. Available: Cricket, Badminton
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs sm:text-sm text-gray-600">Secure & trusted by 1000+ players</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

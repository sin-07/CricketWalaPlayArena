'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MATCH_SPORTS, PRACTICE_SPORTS } from '@/lib/bookingValidation';
import { ChevronDown, Check } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  const handleSportSelect = (sport: string) => {
    onSportChange(sport);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700">
        Select Sport <span className="text-red-500">*</span>
      </label>
      
      {/* Custom Animated Dropdown */}
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white text-left flex items-center justify-between"
          whileTap={{ scale: 0.98 }}
        >
          <span className={selectedSport ? 'text-gray-900' : 'text-gray-500'}>
            {selectedSport || 'Choose a sport'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
              >
                {sports.map((sport, index) => (
                  <motion.button
                    key={sport}
                    type="button"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
                    onClick={() => handleSportSelect(sport)}
                    className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center justify-between group ${
                      selectedSport === sport ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    <span>{sport}</span>
                    {selectedSport === sport && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-5 h-5 text-green-600" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

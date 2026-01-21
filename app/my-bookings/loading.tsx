'use client';

import { motion } from 'framer-motion';
import { GiCricketBat } from 'react-icons/gi';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -20, 20, -20, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 flex items-center justify-center"
        >
          <GiCricketBat className="w-8 h-8 text-white" />
        </motion.div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
            />
          ))}
        </div>
        <p className="text-sm font-medium text-green-700">Loading Bookings...</p>
      </motion.div>
    </div>
  );
}

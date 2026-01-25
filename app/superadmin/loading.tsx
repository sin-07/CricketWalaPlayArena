'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function SuperAdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/30 flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
            />
          ))}
        </div>
        <p className="text-purple-200 font-medium">Loading Super Admin Panel...</p>
      </motion.div>
    </div>
  );
}

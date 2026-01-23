'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, LogIn, Eye, EyeOff, KeyRound } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginSuccess(true);
        // Small delay to show the success animation
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // Show loader when login is successful
  if (loginSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Pic1.jpeg"
            alt="Background"
            fill
            className="object-cover blur-[2px] scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, -20, 20, -20, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-none bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30 flex items-center justify-center"
          >
            <GiCricketBat className="w-10 h-10 text-white" />
          </motion.div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-600"
              />
            ))}
          </div>
          <p className="text-white font-semibold text-lg tracking-wide">Welcome! Loading Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Pic1.jpeg"
          alt="Cricket Arena Background"
          fill
          className="object-cover blur-[2px] scale-110"
          priority
          quality={100}
        />
        {/* Dark Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        {/* Green tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-green-900/20" />
      </div>

      {/* Subtle animated accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-3xl"
        />
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        {/* Professional Sharp-Edged Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Header Section with Logo */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 relative">
            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-green-300 to-yellow-400" />
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-white shadow-lg p-1.5 flex-shrink-0"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/cwpa.jpg"
                    alt="Cricket Wala Play Arena"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                  <Shield className="w-6 h-6" />
                  Admin Portal
                </h1>
                <p className="text-green-100 text-sm mt-0.5 font-medium">Cricket Wala Play Arena</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Welcome message */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 mb-3">
                <KeyRound className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-white font-semibold text-lg">Welcome Back</h2>
              <p className="text-white/50 text-sm mt-1">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 text-red-200 px-4 py-3 text-sm flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-red-400 animate-pulse"></div>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:ring-0 focus:border-green-500 focus:bg-white/10 transition-all font-medium"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white/90 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-green-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:ring-0 focus:border-green-500 focus:bg-white/10 transition-all font-medium"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-green-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 font-bold uppercase tracking-wider hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Security Badge */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-3 text-sm text-white/40">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">256-bit Encrypted</span>
                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                <span className="font-medium">Secure Access</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-white/50 text-sm mt-6 font-medium"
        >
          © 2026 Cricket Wala Play Arena. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}

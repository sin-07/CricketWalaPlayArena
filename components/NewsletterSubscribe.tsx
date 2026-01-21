'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, Loader2, X } from 'lucide-react';

interface NewsletterSubscribeProps {
  variant?: 'inline' | 'card' | 'footer';
  className?: string;
}

export default function NewsletterSubscribe({ 
  variant = 'card', 
  className = '' 
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setMessage('');
  };

  // Footer variant - compact inline form
  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Newsletter
        </h4>
        <p className="text-gray-400 text-sm mb-3">
          Get exclusive offers & updates!
        </p>
        
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Subscribed!</span>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-xs mt-2"
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  // Inline variant - simple horizontal form
  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">{message}</span>
              <button onClick={resetForm} className="ml-auto text-green-600 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for offers & updates"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2"
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  // Card variant - full card with description (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Stay Updated!</h3>
          <p className="text-green-100 text-sm">Get exclusive offers & news</p>
        </div>
      </div>

      <p className="text-green-100 mb-6">
        Subscribe to our newsletter for the latest updates on slot availability, special discounts, and cricket events!
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-4"
          >
            <CheckCircle className="w-6 h-6 text-green-200" />
            <div>
              <p className="font-semibold">{message}</p>
              <button
                onClick={resetForm}
                className="text-green-200 text-sm underline hover:text-white"
              >
                Subscribe another email
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                disabled={status === 'loading'}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Subscribe Now
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {status === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-200 text-sm mt-3 bg-red-500/20 px-3 py-2 rounded-lg"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

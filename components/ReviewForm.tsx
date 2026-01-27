'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface ReviewFormProps {
  bookingId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ReviewForm({ bookingId, onSuccess, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setErrorMessage('Please select a star rating');
      setSubmitStatus('error');
      return;
    }

    if (reviewText.length < 10) {
      setErrorMessage('Review must be at least 10 characters');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          userPhone,
          userEmail,
          bookingId,
          rating,
          reviewText,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        // Reset form
        setRating(0);
        setReviewText('');
        setUserName('');
        setUserPhone('');
        setUserEmail('');
        onSuccess?.();
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none transform transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 sm:p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">
          Your review has been submitted successfully. It will be visible once approved by our team.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Experience</h2>
      <p className="text-gray-600 mb-6">We&apos;d love to hear about your visit to Cricket Wala Play Arena!</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRating />
          {rating > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {rating === 5 && 'Excellent! ⭐'}
              {rating === 4 && 'Very Good! 👍'}
              {rating === 3 && 'Good 🙂'}
              {rating === 2 && 'Fair 😐'}
              {rating === 1 && 'Poor 😞'}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Enter your name"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="userPhone"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            required
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="10-digit mobile number"
          />
        </div>

        {/* Email (Optional) */}
        <div>
          <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="email"
            id="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="your@email.com"
          />
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            minLength={10}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
            placeholder="Share your experience with us..."
          />
          <p className="text-sm text-gray-500 mt-1">
            {reviewText.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {submitStatus === 'error' && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isSubmitting || rating === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

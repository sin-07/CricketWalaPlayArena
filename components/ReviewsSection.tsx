'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?limit=10');
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Auto-scroll reviews every 5 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="reviews" className="py-12 sm:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
              What Our Players Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from cricket enthusiasts who trained at Cricket Wala Play Arena
            </p>

            {/* Stats */}
            {stats.totalReviews > 0 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <div className="flex">
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                  <span className="font-bold text-gray-800">{stats.averageRating}</span>
                </div>
                <div className="text-gray-600">
                  Based on <span className="font-semibold text-green-600">{stats.totalReviews}</span> reviews
                </div>
              </div>
            )}
          </motion.div>

          {/* Reviews Carousel */}
          {reviews.length > 0 ? (
            <div className="relative max-w-4xl mx-auto">
              {/* Navigation Arrows */}
              {reviews.length > 1 && (
                <>
                  <button
                    onClick={prevReview}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextReview}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}

              {/* Review Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <Quote className="w-16 h-16 text-green-600" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                        {reviews[currentIndex]?.userName?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {reviews[currentIndex]?.userName}
                        </h3>
                        {renderStars(reviews[currentIndex]?.rating)}
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
                        &quot;{reviews[currentIndex]?.reviewText}&quot;
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(reviews[currentIndex]?.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots Indicator */}
              {reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-6 bg-green-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share your experience!</p>
            </div>
          )}

          {/* Write Review Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
            >
              <Star className="w-5 h-5" />
              Write a Review
            </button>
          </div>
        </div>
      </section>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <ReviewForm
                onSuccess={() => {
                  fetchReviews();
                }}
                onClose={() => setShowReviewForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

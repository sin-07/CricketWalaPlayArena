'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Loader2, 
  RefreshCw,
  Filter,
  MessageSquare,
  AlertTriangle,
  User,
  Phone,
  Calendar
} from 'lucide-react';

interface Review {
  _id: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  bookingId?: string;
  rating: number;
  reviewText: string;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface ReviewCounts {
  pending: number;
  approved: number;
  total: number;
}

export default function AdminReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState<ReviewCounts>({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(`/api/admin/reviews?limit=100${statusParam}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const response = await fetch('/api/admin/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId }),
      });
      
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.error || 'Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const response = await fetch('/api/admin/reviews/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowDeleteConfirm(null);
        fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-600" />
              Review Management
            </h2>
            <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
          </div>
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
                <p className="text-sm text-yellow-600">Pending Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{counts.approved}</p>
                <p className="text-sm text-green-600">Approved Reviews</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{counts.total}</p>
                <p className="text-sm text-blue-600">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            {(['all', 'PENDING', 'APPROVED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                {status === 'PENDING' && counts.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                    {counts.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">
              {filter === 'PENDING' 
                ? 'No pending reviews to approve' 
                : filter === 'APPROVED' 
                  ? 'No approved reviews yet'
                  : 'No reviews have been submitted yet'}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className={`h-1 ${review.status === 'PENDING' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                  {/* Review Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        review.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {review.status}
                      </span>
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-800 leading-relaxed">&quot;{review.reviewText}&quot;</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {review.userPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {review.approvedBy && (
                      <p className="text-xs text-gray-400">
                        Approved by {review.approvedBy} on {formatDate(review.approvedAt!)}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 lg:flex-col">
                    {review.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(review._id)}
                        disabled={actionLoading === review._id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === review._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(review._id)}
                      disabled={actionLoading === review._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Review?</h3>
              <p className="text-gray-600 text-center mb-6">
                This action cannot be undone. The review will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={actionLoading === showDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === showDeleteConfirm ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

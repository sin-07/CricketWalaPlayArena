'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertTriangle, RefreshCw, CheckCircle, Ban, IndianRupee, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TurfBooking } from '@/types';

interface AdminBookingCancelModalProps {
  booking: TurfBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const CANCELLATION_REASONS = [
  'Customer requested cancellation',
  'Turf maintenance / unavailable',
  'Weather conditions',
  'Double booking conflict',
  'Payment issue',
  'Customer no-show (pre-emptive cancel)',
  'Event / tournament scheduling',
  'Other',
];

const AdminBookingCancelModal: React.FC<AdminBookingCancelModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelled,
}) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'result'>('confirm');
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [processRefund, setProcessRefund] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    refund?: {
      status: string;
      amount: number;
      refundId?: string;
      notes?: string;
    };
  } | null>(null);

  const isOnlinePayment = booking?.source === 'online' && booking?.paymentStatus === 'success';
  const refundableAmount = booking?.advancePayment || booking?.totalPrice || booking?.finalPrice || 0;

  const resetModal = () => {
    setStep('confirm');
    setCancellationReason('');
    setCustomReason('');
    setProcessRefund(true);
    setLoading(false);
    setResult(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleCancel = async () => {
    const reason = cancellationReason === 'Other' ? customReason : cancellationReason;

    if (!reason || reason.trim().length < 3) {
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: booking?._id,
          cancellationReason: reason.trim(),
          processRefund: isOnlinePayment ? processRefund : false,
        }),
      });

      const data = await response.json();

      setResult({
        success: data.success,
        message: data.success
          ? 'Booking cancelled successfully'
          : data.error || 'Failed to cancel booking',
        refund: data.data?.refund,
      });
      setStep('result');

      if (data.success) {
        onCancelled();
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Network error. Please try again.',
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!booking) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/cancel-booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId: booking._id }),
      });

      const data = await response.json();

      setResult({
        success: data.success,
        message: data.success
          ? 'Refund processed successfully'
          : data.error || 'Refund failed',
        refund: data.success
          ? { status: 'processed', amount: data.data?.amount, refundId: data.data?.refundId }
          : { status: 'failed', amount: 0 },
      });

      if (data.success) {
        onCancelled();
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Network error during refund.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const bookingRef = `CWPA${parseInt(booking._id.slice(-8), 16).toString().slice(-4).padStart(4, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            {step === 'confirm' && `Cancel booking ${bookingRef} for ${booking.name}`}
            {step === 'processing' && 'Processing cancellation...'}
            {step === 'result' && (result?.success ? 'Cancellation complete' : 'Cancellation failed')}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Booking Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-800 mb-1">You are about to cancel this booking:</p>
                    <div className="text-red-700 space-y-0.5">
                      <p><span className="font-medium">Ref:</span> {bookingRef}</p>
                      <p><span className="font-medium">Customer:</span> {booking.name} ({booking.mobile})</p>
                      <p><span className="font-medium">Sport:</span> {booking.sport} ({booking.bookingType})</p>
                      <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p><span className="font-medium">Slot:</span> {booking.slot}</p>
                      <p><span className="font-medium">Amount:</span> ₹{booking.totalPrice || booking.finalPrice}</p>
                      <p><span className="font-medium">Source:</span> {booking.source === 'offline' ? 'Offline (Walk-in)' : 'Online'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => {
                    setCancellationReason(e.target.value);
                    if (e.target.value !== 'Other') setCustomReason('');
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                >
                  <option value="">Select a reason...</option>
                  {CANCELLATION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {cancellationReason === 'Other' && (
                  <motion.textarea
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    placeholder="Enter cancellation reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={500}
                    className="w-full mt-2 border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                    rows={3}
                  />
                )}
              </div>

              {/* Refund Option (only for online payments) */}
              {isOnlinePayment && booking.razorpayPaymentId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IndianRupee className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-800 text-sm mb-2">Online Payment Detected</p>
                      <p className="text-blue-700 text-xs mb-3">
                        This booking was paid online. Refund amount: <span className="font-bold">₹{refundableAmount}</span>
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={processRefund}
                          onChange={(e) => setProcessRefund(e.target.checked)}
                          className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-800 font-medium">Process refund automatically via Razorpay</span>
                      </label>
                      {!processRefund && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Refund will be marked as pending. You can process it later.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={
                    !cancellationReason ||
                    (cancellationReason === 'Other' && customReason.trim().length < 3)
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center justify-center"
            >
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
              <p className="text-gray-700 font-medium">Cancelling booking...</p>
              {isOnlinePayment && processRefund && (
                <p className="text-gray-500 text-sm mt-1">Processing refund via Razorpay...</p>
              )}
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Result Status */}
              <div
                className={`rounded-lg p-5 text-center ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                )}
                <h3
                  className={`text-lg font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </h3>
              </div>

              {/* Refund Details */}
              {result.refund && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-800">Refund Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        result.refund.status === 'processed'
                          ? 'text-green-600'
                          : result.refund.status === 'failed'
                          ? 'text-red-600'
                          : result.refund.status === 'pending'
                          ? 'text-amber-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {result.refund.status === 'not_applicable'
                        ? 'Not Applicable'
                        : result.refund.status?.charAt(0).toUpperCase() + result.refund.status?.slice(1)}
                    </span>

                    {result.refund.amount > 0 && (
                      <>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">₹{result.refund.amount}</span>
                      </>
                    )}

                    {result.refund.refundId && (
                      <>
                        <span className="text-gray-600">Refund ID:</span>
                        <span className="font-mono text-xs">{result.refund.refundId}</span>
                      </>
                    )}
                  </div>
                  {result.refund.notes && (
                    <p className="text-xs text-gray-500 mt-2 border-t pt-2">{result.refund.notes}</p>
                  )}

                  {/* Retry Refund Button */}
                  {result.refund.status === 'pending' || result.refund.status === 'failed' ? (
                    <Button
                      onClick={handleProcessRefund}
                      disabled={loading}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {result.refund.status === 'failed' ? 'Retry Refund' : 'Process Refund Now'}
                    </Button>
                  ) : null}
                </div>
              )}

              {/* Close Button */}
              <Button onClick={handleClose} className="w-full" variant="outline">
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBookingCancelModal;

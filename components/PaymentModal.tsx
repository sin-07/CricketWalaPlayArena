'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  booking: Booking;
  orderId: string;
  amount: number;
  bookingDetails?: {
    boxId: number;
    boxName: string;
    date: string;
    timeSlotIds: number[];
    customerName: string;
    email: string;
    phone: string;
    pricePerHour: number;
    totalAmount: number;
  };
  onSuccess: (paymentId: string, signature: string) => void;
  onFailure: (error: string) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  orderId,
  amount,
  bookingDetails,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Cricket Wala Play Arena',
        description: `Booking for ${booking.boxName}`,
        image: '/logo.png',
        customer_notif: 1,
        notes: {
          bookingRef: booking.bookingRef,
          customerName: booking.customerName,
          phone: booking.phone,
        },
        handler: async (response: any) => {
          try {
            // Ensure timeSlotIds is always an array
            const timeSlotIds = bookingDetails?.timeSlotIds 
              || booking.timeSlotIds 
              || [booking.timeSlotId];
            
            // Verify payment on backend and CREATE booking
            const verifyResponse = await fetch('/api/bookings/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                bookingRef: booking.bookingRef,
                bookingDetails: bookingDetails || {
                  boxId: booking.boxId,
                  boxName: booking.boxName,
                  date: booking.date,
                  timeSlotIds: Array.isArray(timeSlotIds) ? timeSlotIds : [timeSlotIds],
                  customerName: booking.customerName,
                  email: booking.email,
                  phone: booking.phone,
                  pricePerHour: booking.pricePerHour,
                  totalAmount: booking.totalAmount,
                },
              }),
            });

            const data = await verifyResponse.json();

            if (!verifyResponse.ok || !data.success) {
              throw new Error(data.error || 'Payment verification failed');
            }

            onSuccess(response.razorpay_payment_id, response.razorpay_signature);
          } catch (err: any) {
            onFailure(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: booking.customerName,
          email: booking.email,
          contact: booking.phone,
        },
        theme: {
          color: '#22c55e',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onFailure('Payment cancelled by user');
          },
        },
      };

      const razorpay = (window as any).Razorpay;
      if (!razorpay) {
        throw new Error('Razorpay script not loaded');
      }

      const paymentObject = new razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setError(err.message || 'Failed to open payment gateway');
      onFailure(err.message || 'Failed to open payment gateway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-green-500 text-white">
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Ref:</span>
                <span className="font-semibold">{booking.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arena:</span>
                <span className="font-semibold">{booking.boxName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{booking.customerName}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-800 font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">₹{amount}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Click "Pay Now" to proceed with Razorpay secure payment gateway.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;

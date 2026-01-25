'use client';

import React, { useState, useEffect } from 'react';
import { createPaymentOrder, verifyPayment, loadRazorpayScript, openRazorpayCheckout } from '@/lib/paymentFlow';

/**
 * Test Payment Component
 * This component demonstrates the complete payment flow with Razorpay
 * Amount is set to ₹1 for testing when NEXT_PUBLIC_TEST_PRICE_PER_HOUR=1
 */
export default function TestPayment() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
      if (!loaded) {
        setError('Failed to load Razorpay SDK');
      }
    });
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Razorpay SDK not loaded yet');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Step 1: Create order on backend
      setMessage('Creating payment order...');
      const orderResponse = await createPaymentOrder({
        amount: 100, // Will be set to 1 rupee if test mode is enabled
        bookingRef: 'TEST' + Date.now(),
        customerName: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
      });

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      setMessage(`Order created: ${orderResponse.data.orderId}, Amount: ₹${orderResponse.data.amount}`);

      // Step 2: Open Razorpay checkout
      openRazorpayCheckout(
        orderResponse.data.orderId,
        orderResponse.data.amount,
        orderResponse.data.keyId,
        {
          name: 'Test User',
          email: 'test@example.com',
          phone: '9999999999',
          bookingRef: 'TEST' + Date.now(),
        },
        async (response: any) => {
          // Step 3: Verify payment on backend
          setMessage('Verifying payment...');
          try {
            const verifyResponse = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingRef: orderResponse.data!.orderId,
            });

            if (verifyResponse.success) {
              setMessage(`✅ Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            } else {
              throw new Error(verifyResponse.message || 'Verification failed');
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          }
          setLoading(false);
        },
        (errorMsg: string) => {
          setError(errorMsg);
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test Payment Integration</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold text-blue-900 mb-2">Test Mode</h2>
          <p className="text-sm text-blue-800">
            {process.env.NEXT_PUBLIC_TEST_PRICE_PER_HOUR === '1' 
              ? '✅ Test mode is ENABLED - Payment will be ₹1'
              : '⚠️ Test mode is DISABLED - Payment will be actual amount'}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Set NEXT_PUBLIC_TEST_PRICE_PER_HOUR=1 in .env.local for test mode
          </p>
        </div>

        {!scriptLoaded && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
            Loading Razorpay SDK...
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : 'Test Payment (₹1)'}
        </button>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold mb-2">Test Card Details (Razorpay Test Mode)</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>Card:</strong> 4111 1111 1111 1111</li>
            <li><strong>Expiry:</strong> Any future date (e.g., 12/25)</li>
            <li><strong>CVV:</strong> Any 3 digits (e.g., 123)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

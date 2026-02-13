/**
 * Payment Flow Helper
 * Handles the complete payment flow from order creation to verification
 */

export interface CreateOrderParams {
  amount: number;
  bookingRef: string;
  customerName: string;
  email: string;
  phone: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data?: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
  message?: string;
  error?: string;
  paymentsDisabled?: boolean;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  bookingRef: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    bookingRef: string;
    paymentId: string;
    status: string;
    paymentStatus: string;
  };
}

/**
 * Create a Razorpay order through backend API
 * This is more secure as it keeps the secret key on the server
 */
export async function createPaymentOrder(
  params: CreateOrderParams
): Promise<CreateOrderResponse> {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    // Check if payments are disabled
    if (data.paymentsDisabled) {
      return {
        success: false,
        paymentsDisabled: true,
        message: data.message || 'Payment service is temporarily unavailable',
      };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment order');
    }

    return data;
  } catch (error: any) {
    console.error('Create order error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create payment order',
    };
  }
}

/**
 * Verify Razorpay payment through backend API
 */
export async function verifyPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResponse> {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data;
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return {
      success: false,
      message: error.message || 'Payment verification failed',
    };
  }
}

/**
 * Open Razorpay checkout modal
 */
/**
 * Open Razorpay checkout modal
 * Handles success, failure, and cancellation
 */
export function openRazorpayCheckout(
  orderId: string,
  amount: number,
  keyId: string,
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    bookingRef: string;
  },
  onSuccess: (response: any) => void,
  onFailure: (error: string) => void
): void {
  const options = {
    key: keyId,
    order_id: orderId,
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    name: 'Cricket Wala Play Arena',
    description: `Booking ${customerDetails.bookingRef}`,
    image: '/favicon.ico', // Use existing favicon
    prefill: {
      name: customerDetails.name,
      email: customerDetails.email,
      contact: customerDetails.phone,
    },
    notes: {
      bookingRef: customerDetails.bookingRef,
    },
    theme: {
      color: '#22c55e',
    },
    handler: onSuccess,
    retry: {
      enabled: false, // Disable retry to prevent showing payment again after success/failure on mobile
    },
    modal: {
      ondismiss: () => {
        onFailure('Payment was cancelled. Please fill the form again to book.');
      },
      confirm_close: true, // Ask for confirmation before closing
      escape: true, // Allow ESC key to close
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  
  // Handle payment failures (wrong PIN, insufficient funds, etc.)
  razorpay.on('payment.failed', function (response: any) {
    console.error('Payment failed:', response.error);
    
    // Close the Razorpay modal
    razorpay.close();
    
    // Get user-friendly error message
    let errorMessage = 'Payment failed. Please fill the form again to book.';
    
    if (response.error) {
      const errorCode = response.error.code;
      const errorDesc = response.error.description;
      
      // Map error codes to user-friendly messages
      if (errorCode === 'BAD_REQUEST_ERROR') {
        if (errorDesc?.includes('pin') || errorDesc?.includes('PIN')) {
          errorMessage = 'Incorrect PIN entered. Please fill the form again to book.';
        } else if (errorDesc?.includes('insufficient') || errorDesc?.includes('balance')) {
          errorMessage = 'Insufficient balance. Please fill the form again to book.';
        } else if (errorDesc?.includes('expired')) {
          errorMessage = 'Card expired. Please fill the form again to book.';
        } else if (errorDesc?.includes('declined')) {
          errorMessage = 'Payment declined by bank. Please fill the form again to book.';
        } else {
          errorMessage = `Payment failed: ${errorDesc}. Please fill the form again.`;
        }
      } else if (errorCode === 'GATEWAY_ERROR') {
        errorMessage = 'Bank server error. Please fill the form again to book.';
      } else if (errorCode === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and fill the form again.';
      }
    }
    
    onFailure(errorMessage);
  });

  razorpay.open();
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

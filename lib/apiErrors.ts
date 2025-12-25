import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Handle specific error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle Razorpay errors
  if (error.statusCode && error.message) {
    return NextResponse.json(
      { success: false, error: 'Payment service error. Please try again.' },
      { status: 500 }
    );
  }

  // Handle MongoDB errors
  if (error.name === 'MongoServerError') {
    return NextResponse.json(
      { success: false, error: 'Database error. Please try again later.' },
      { status: 500 }
    );
  }

  // Default error
  return NextResponse.json(
    { success: false, error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class PaymentError extends ApiError {
  constructor(message: string = 'Payment processing failed') {
    super(402, message);
    this.name = 'PaymentError';
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Session timeout: 2 hours in milliseconds
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

export interface AuthResult {
  authenticated: boolean;
  error?: string;
  response?: NextResponse;
}

/**
 * Verify admin authentication for API routes
 * Use this in API routes that require admin authentication
 */
export async function verifyAdminAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('adminToken');
    const loginTime = cookieStore.get('adminLoginTime');

    if (!adminToken) {
      return {
        authenticated: false,
        error: 'Unauthorized - No authentication token',
        response: NextResponse.json(
          { error: 'Unauthorized - Admin authentication required' },
          { status: 401 }
        ),
      };
    }

    // Verify token format
    try {
      const decoded = Buffer.from(adminToken.value, 'base64').toString();
      if (!decoded.includes(':')) {
        return {
          authenticated: false,
          error: 'Invalid token format',
          response: NextResponse.json(
            { error: 'Unauthorized - Invalid authentication token' },
            { status: 401 }
          ),
        };
      }
    } catch {
      return {
        authenticated: false,
        error: 'Token decode failed',
        response: NextResponse.json(
          { error: 'Unauthorized - Invalid authentication token' },
          { status: 401 }
        ),
      };
    }

    // Check session expiration
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime.value);
      if (elapsed >= SESSION_TIMEOUT) {
        return {
          authenticated: false,
          error: 'Session expired',
          response: NextResponse.json(
            { error: 'Session expired - Please login again' },
            { status: 401 }
          ),
        };
      }
    } else {
      return {
        authenticated: false,
        error: 'No login time found',
        response: NextResponse.json(
          { error: 'Session invalid - Please login again' },
          { status: 401 }
        ),
      };
    }

    return { authenticated: true };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      error: 'Auth check failed',
      response: NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Wrapper for protected API route handlers
 * Automatically checks authentication before executing the handler
 */
export function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await verifyAdminAuth();
    
    if (!authResult.authenticated && authResult.response) {
      return authResult.response;
    }
    
    return handler(request);
  };
}

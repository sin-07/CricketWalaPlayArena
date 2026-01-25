import { NextRequest, NextResponse } from 'next/server';

// Session timeout: 2 hours in milliseconds
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;

// Routes that should be accessible without authentication
const publicRoutes = ['/admin/login', '/admin/direct-setup', '/', '/booking', '/all-bookings', '/my-bookings'];

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    if (!decoded.includes(':')) return false;
    
    // Basic validation - token should have username:timestamp format
    const parts = decoded.split(':');
    if (parts.length < 2) return false;
    
    return true;
  } catch {
    return false;
  }
}

function isSessionExpired(loginTime: string | undefined): boolean {
  if (!loginTime) return true;
  
  try {
    const loginTimeNum = parseInt(loginTime);
    const elapsed = Date.now() - loginTimeNum;
    return elapsed >= SESSION_TIMEOUT;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Checking path:', pathname);
  }
  
  // Allow public routes (including home page, booking pages, etc.)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check if this is an admin page
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  
  // Check if this is a protected admin API route (all methods protected)
  const isAdminApi = pathname.startsWith('/api/admin/logout') ||
                     pathname.startsWith('/api/admin/refresh-session');
  
  // Check if this is a protected API route with write operation
  const isProtectedApi = pathname.startsWith('/api/gallery') || 
                         pathname.startsWith('/api/upload') || 
                         pathname.startsWith('/api/bookings');
  const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
  
  // Allow public booking endpoints (no auth required)
  if ((pathname === '/api/bookings/direct' || pathname === '/api/bookings') && request.method === 'POST') {
    return NextResponse.next();
  }
  
  // For API routes, only protect write operations (except admin APIs which are always protected)
  if (isProtectedApi && !isWriteOperation) {
    return NextResponse.next();
  }
  
  // Check authentication for admin pages, admin API routes, and protected API write operations
  if (isAdminPage || isAdminApi || (isProtectedApi && isWriteOperation)) {
    const adminToken = request.cookies.get('adminToken')?.value;
    const loginTime = request.cookies.get('adminLoginTime')?.value;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Auth check - Token exists:', !!adminToken, 'LoginTime exists:', !!loginTime);
    }
    
    // Verify token
    if (!verifyAdminToken(adminToken)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Invalid token, redirecting to login');
      }
      if (isProtectedApi || isAdminApi) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin authentication required' },
          { status: 401 }
        );
      }
      // Redirect to login page for protected pages
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check session expiration
    if (isSessionExpired(loginTime)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Session expired, redirecting to login');
      }
      // Clear expired cookies
      const response = (isProtectedApi || isAdminApi)
        ? NextResponse.json(
            { error: 'Session expired - Please login again' },
            { status: 401 }
          )
        : NextResponse.redirect(new URL('/admin/login?expired=true', request.url));
      
      response.cookies.delete('adminToken');
      response.cookies.delete('adminLoginTime');
      return response;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Auth successful, allowing access');
    }
  }
  
  // Add security headers for production
  const response = NextResponse.next();
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match admin pages (exact and nested)
    '/admin',
    '/admin/:path*',
    // Match admin API routes
    '/api/admin/logout',
    '/api/admin/refresh-session',
    // Match protected API routes
    '/api/gallery/:path*',
    '/api/upload/:path*',
    '/api/bookings/:path*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies or headers
  const sessionToken = request.cookies.get('session-token')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '');

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/change-password'
  ];

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!sessionToken) {
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Decode session token
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    // Check if session is expired
    if (Date.now() > sessionData.exp) {
      // Clear session and redirect to login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('session-token');
      return response;
    }

    // Super Admin routes protection
    if (pathname.startsWith('/SuperAdmin')) {
      if (sessionData.role !== 'super_admin') {
        // Redirect admins to their dashboard
        return NextResponse.redirect(new URL('/Admin/Inspection/management/analytics', request.url));
      }
    }

    // Admin routes protection (both roles can access)
    if (pathname.startsWith('/Admin')) {
      if (sessionData.role !== 'admin' && sessionData.role !== 'super_admin') {
        // Redirect to login if not admin or super_admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

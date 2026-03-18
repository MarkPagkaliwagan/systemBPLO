import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[MIDDLEWARE] Checking path:', pathname);
  
  const sessionToken =
    request.cookies.get('session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  console.log('[MIDDLEWARE] Token exists:', !!sessionToken);

  const publicExactRoutes = ['/'];
  const publicPrefixRoutes = [
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/auth/logout',
  ];

  const isPublicRoute =
    publicExactRoutes.includes(pathname) ||
    publicPrefixRoutes.some(route => pathname.startsWith(route));

  console.log('[MIDDLEWARE] Is public route:', isPublicRoute);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  if (!sessionToken) {
    console.log('[MIDDLEWARE] No token found, redirecting to home');
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  console.log('[MIDDLEWARE] Verifying token...');
  const sessionData = await verifySessionToken(sessionToken) as {
    userId: string;
    email: string;
    role: string;
    exp: number;
  } | null;

  if (!sessionData) {
    console.log('[MIDDLEWARE] Invalid token, redirecting to home');
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  console.log('[MIDDLEWARE] Valid session for role:', sessionData.role);

  // Super Admin only
  if (pathname.startsWith('/SuperAdmin')) {
    if (sessionData.role !== 'super_admin') {
      console.log('[MIDDLEWARE] Access denied: not super_admin');
      return NextResponse.redirect(
        new URL('/Admin/Inspection/management/analytics', request.url)
      );
    }
  }

  // Admin + Super Admin
  if (pathname.startsWith('/Admin')) {
    if (
      sessionData.role !== 'admin' &&
      sessionData.role !== 'super_admin'
    ) {
      console.log('[MIDDLEWARE] Access denied: not admin or super_admin');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};

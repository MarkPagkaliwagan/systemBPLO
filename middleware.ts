import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

if (
  pathname.startsWith('/notice') ||
  pathname.startsWith('/api/save-notice')
) {
  return NextResponse.next();
}

console.log("PATH:", pathname);

  console.log('[MIDDLEWARE] Checking path:', pathname);

  // Skip middleware for static files
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get('session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  console.log('[MIDDLEWARE] Token exists:', !!sessionToken);

  const publicExactRoutes = ['/', '/session-expired']; // ← added /session-expired
  const publicPrefixRoutes = [
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/auth/logout',

    '/notice',

  ];

  const isPublicRoute =
    publicExactRoutes.includes(pathname) ||
    publicPrefixRoutes.some((route) => pathname.startsWith(route));

  console.log('[MIDDLEWARE] Is public route:', isPublicRoute);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // All non-public routes require a valid session
  if (!sessionToken) {
    console.log('[MIDDLEWARE] No token found, redirecting to session-expired');
    // ↑ Changed: redirect to /session-expired instead of /
    // This breaks the loop: login page no longer gets hit with stale localStorage data
    const response = NextResponse.redirect(new URL('/session-expired', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  console.log('[MIDDLEWARE] Verifying token...');
  const sessionData = (await verifySessionToken(sessionToken)) as {
    userId: string;
    email: string;
    role: string;
    exp: number;
  } | null;

  if (!sessionData) {
    console.log('[MIDDLEWARE] Invalid/expired token, redirecting to session-expired');
    // ↑ Changed: expired token → /session-expired, not /
    const response = NextResponse.redirect(new URL('/session-expired', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  const { role } = sessionData;
  console.log('[MIDDLEWARE] Valid session for role:', role);

  // ── /SuperAdmin  →  admin only ─────────────────────────────────────────
  if (pathname.startsWith('/SuperAdmin')) {
    if (role !== 'admin') {
      console.log('[MIDDLEWARE] Access denied to /SuperAdmin: redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── /Admin  →  staff only ──────────────────────────────────────────────
  if (pathname.startsWith('/Admin')) {
    if (role !== 'staff') {
      console.log('[MIDDLEWARE] Access denied to /Admin: redirecting to login');
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
    '/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Get token from cookie or header
  const sessionToken =
    request.cookies.get('session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // ✅ PUBLIC ROUTES
  const publicExactRoutes = ['/'];
  const publicPrefixRoutes = [
    '/forgot-password',
    '/reset-password',
    '/api/auth',
  ];

  const isPublicRoute =
    publicExactRoutes.includes(pathname) ||
    publicPrefixRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ❌ No token → redirect to login
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // ✅ Decode token (Edge runtime safe)
    const [payloadB64, signature] = sessionToken.split('.');

    if (!payloadB64 || !signature) {
      throw new Error('Invalid token format');
    }

    const sessionData = JSON.parse(atob(payloadB64));

    // ❌ Expired token
    if (Date.now() > sessionData.exp) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('session-token');
      return response;
    }

    // ✅ ROLE-BASED ACCESS

    // Super Admin only
    if (pathname.startsWith('/SuperAdmin')) {
      if (sessionData.role !== 'super_admin') {
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
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

  } catch (error) {
    // ❌ Invalid token
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session-token');
    return response;
  }

  return NextResponse.next();
}

// ✅ Apply middleware to all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
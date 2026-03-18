import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get('session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

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

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const sessionData = await verifySessionToken(sessionToken) as {
    userId: string;
    email: string;
    role: string;
    exp: number;
  } | null;

  if (!sessionData) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session-token');
    return response;
  }

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

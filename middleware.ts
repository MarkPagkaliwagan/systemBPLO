import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// ENVIRONMENT GUARD
// Add to .env.local: SECRET_KEY=<random-64-char-hex>
// Generate with: openssl rand -hex 32
// ============================================================

const SECRET_KEY = process.env.SECRET_KEY ?? '';

// ============================================================
// CRYPTO UTILITIES
// ============================================================

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const [payloadB64, signatureB64] = token.split('.');

    if (!payloadB64 || !signatureB64) return null;

    const key = await getHmacKey(SECRET_KEY);
    const encoder = new TextEncoder();

    const signatureBytes = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadB64)
    );

    if (!isValid) return null;

    const payload = JSON.parse(atob(payloadB64));

    // Validate required fields exist and are correct types
    if (
      typeof payload !== 'object'       ||
      typeof payload.exp !== 'number'   ||
      typeof payload.role !== 'string'  ||
      typeof payload.userId !== 'string'
    ) {
      return null;
    }

    // Check token expiry
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// ROUTE DEFINITIONS
// ============================================================

// Exact-match public pages (no auth required)
const PUBLIC_PAGES: string[] = [
  '/',
  '/forgot-password',
  '/reset-password',
];

// Prefix-match public API endpoints (no auth required)
const PUBLIC_API_PREFIXES: string[] = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/change-password',
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PAGES.includes(pathname)) return true;
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  return false;
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

function handleUnauthenticated(request: NextRequest): NextResponse {
  // Return JSON 401 for API routes to avoid leaking page structure
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }
  return NextResponse.redirect(new URL('/', request.url));
}

function handleInvalidToken(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Invalid or expired session. Please log in again.' },
      { status: 401 }
    );
  }
  // Delete the bad cookie and send user back to login
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('session-token');
  return response;
}

// ============================================================
// MIDDLEWARE ENTRY POINT
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard: refuse all requests if SECRET_KEY is not configured
  if (!SECRET_KEY) {
    console.error(
      '[Middleware] FATAL: SECRET_KEY environment variable is not set. ' +
      'All protected routes are blocked.'
    );
    return NextResponse.json(
      { error: 'Server misconfiguration. Contact support.' },
      { status: 500 }
    );
  }

  // Step 1: Pass public routes through immediately
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Step 2: Extract session token — cookie takes priority over Authorization header
  const sessionToken =
    request.cookies.get('session-token')?.value ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  // Step 3: No token present → unauthenticated
  if (!sessionToken) {
    return handleUnauthenticated(request);
  }

  // Step 4: Cryptographically verify the token
  const sessionData = await verifyToken(sessionToken);

  if (!sessionData) {
    // Token is expired, forged, or malformed
    return handleInvalidToken(request);
  }

  const role = sessionData.role as string;
  const userId = sessionData.userId as string;

  // Step 5: Role-based route protection

  // /SuperAdmin/** — only super_admin
  if (pathname.startsWith('/SuperAdmin')) {
    if (role !== 'super_admin') {
      // Redirect unauthorized admins to their own dashboard
      return NextResponse.redirect(
        new URL('/Admin/Inspection/management/analytics', request.url)
      );
    }
  }

  // /Admin/** — admin or super_admin
  if (pathname.startsWith('/Admin')) {
    if (role !== 'admin' && role !== 'super_admin') {
      return handleUnauthenticated(request);
    }
  }

  // Step 6: Forward verified identity to downstream route handlers
  // Access in API routes via: request.headers.get('x-user-id')
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-role', role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ============================================================
// MATCHER — skip Next.js internals and static assets
// ============================================================

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';
import { createSessionToken } from '@/lib/session';

// ============================================================
// POST /api/auth/login
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── 1. Input presence check ──────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ── 2. Email format validation ───────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ── 3. Password length guard (prevent DoS via bcrypt) ────
    // bcrypt silently truncates at 72 bytes — reject anything longer
    if (password.length > 72) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── 4. Fetch user from database ──────────────────────────
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, name, email, password, role, is_active')
      .eq('email', normalizedEmail)
      .single();

    if (dbError || !user) {
      // Always return the same error — never reveal if the email exists
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ── 5. Block deactivated accounts ───────────────────────
    if (user.is_active === false) {
      return NextResponse.json(
        { error: 'Account is disabled. Contact support.' },
        { status: 403 }
      );
    }

    // ── 6. Verify password via bcrypt ────────────────────────
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ── 7. Validate role is an accepted value ─────────────────
    const VALID_ROLES = ['admin', 'super_admin'] as const;
    type Role = typeof VALID_ROLES[number];

    if (!VALID_ROLES.includes(user.role as Role)) {
      console.error(`[Login] Unrecognised role "${user.role}" for user ${user.id}`);
      return NextResponse.json(
        { error: 'Account role is not authorized.' },
        { status: 403 }
      );
    }

    // ── 8. Create HMAC-signed session token ──────────────────
    // createSessionToken lives in lib/session.ts (see below)
    const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours
    const sessionToken = await createSessionToken(
      user.id,
      user.role,
      SESSION_DURATION_SECONDS
    );

    // ── 9. Build response — never expose password hash ───────
    const response = NextResponse.json({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      expiresIn: SESSION_DURATION_SECONDS,
    });

    // ── 10. Set HttpOnly cookie (both dev and prod) ──────────
    // Removed the isProduction guard — dev should behave like prod
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,                                       // JS cannot read it
      secure: process.env.NODE_ENV === 'production',        // HTTPS only in prod
      sameSite: 'lax',                                      // CSRF protection
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[Login] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/auth/login  →  Logout
// ============================================================

export async function DELETE(_request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear the session cookie server-side
    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,     // Instructs browser to delete the cookie immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Logout] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/auth/login  →  Not allowed
// ============================================================

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
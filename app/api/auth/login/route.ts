import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';
import { createSessionToken } from '@/lib/session';

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

    // ── 3. Password length guard ─────────────────────────────
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

    // 🔍 DEBUG — remove after fixing
    console.log('[Login Debug] Input email    :', normalizedEmail);
    console.log('[Login Debug] DB error       :', dbError?.message ?? 'none');
    console.log('[Login Debug] DB error code  :', dbError?.code ?? 'none');
    console.log('[Login Debug] User found     :', user ? 'YES' : 'NO');
    console.log('[Login Debug] Role           :', user?.role ?? 'n/a');
    console.log('[Login Debug] is_active      :', user?.is_active ?? 'n/a');
    console.log('[Login Debug] Hash preview   :', user?.password?.slice(0, 7) ?? 'n/a');

    if (dbError || !user) {
      console.log('[Login Debug] ❌ Failed at step 4 — user not found or DB error');
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

    // 🔍 DEBUG — remove after fixing
    console.log('[Login Debug] Password valid :', isPasswordValid);
    console.log('[Login Debug] Hash starts with:', user.password?.slice(0, 4));

    if (!isPasswordValid) {
      console.log('[Login Debug] ❌ Failed at step 6 — wrong password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ── 7. Validate role ──────────────────────────────────────
    const VALID_ROLES = ['admin', 'super_admin'] as const;
    type Role = typeof VALID_ROLES[number];

    if (!VALID_ROLES.includes(user.role as Role)) {
      console.log('[Login Debug] ❌ Failed at step 7 — invalid role:', user.role);
      return NextResponse.json(
        { error: 'Account role is not authorized.' },
        { status: 403 }
      );
    }

    // ── 8. Create HMAC-signed session token ──────────────────
    const SESSION_DURATION_SECONDS = 60 * 60 * 8;
    const sessionToken = await createSessionToken(
      user.id,
      user.role,
      SESSION_DURATION_SECONDS
    );

    // ── 9. Build response ─────────────────────────────────────
    const response = NextResponse.json({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      expiresIn: SESSION_DURATION_SECONDS,
    });

    // ── 10. Set HttpOnly cookie ───────────────────────────────
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    });

    console.log('[Login Debug] ✅ Login successful for:', normalizedEmail);
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

    response.cookies.set('session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
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

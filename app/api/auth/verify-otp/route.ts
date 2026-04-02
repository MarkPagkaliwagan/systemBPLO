// FILE: src/app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createSessionToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, userId } = await request.json();

    if (!email || !otp || !userId) {
      return NextResponse.json(
        { error: 'Email, OTP, and user ID are required.' },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format.' },
        { status: 400 }
      );
    }
    const { data: otpRecord, error: otpError } = await supabase
      .from('login_2fa_otp')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .eq('code', otp)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please try again.' },
        { status: 401 }
      );
    }
    const { error: markUsedError } = await supabase
      .from('login_2fa_otp')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

    if (markUsedError) {
      console.error('[verify-otp] Failed to mark OTP as used:', markUsedError);
      return NextResponse.json(
        { error: 'Internal server error.' },
        { status: 500 }
      );
    }
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // ── Step 5: Create session — only reached after OTP is verified ────────
    const sessionToken = await createSessionToken(user.id, user.role);
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in ms

    const response = NextResponse.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      sessionToken,
      expiresIn,
    });

    // ── Step 6: Set HTTP-only session cookie ──────────────────────────────
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours in seconds
    });

    return response;

  } catch (error) {
    console.error('[verify-otp] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
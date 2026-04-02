// FILE: src/app/api/auth/send-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';
import { generateOTP, generateOTPEmailTemplate } from '@/lib/otpUtils';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isResend = false } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // ── Step 1: Re-validate credentials ──────────────────────────────────
    // Always re-check so this endpoint cannot be called without a valid password.
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // ── Step 2: Wipe all existing OTPs for this user ──────────────────────
    // Fresh login or resend — always clear so only one active code exists.
    const { error: deleteError } = await supabase
      .from('login_2fa_otp')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[send-otp] Failed to clear old OTPs:', deleteError);
      return NextResponse.json(
        { error: 'Internal server error.' },
        { status: 500 }
      );
    }

    // ── Step 3: Generate and store a fresh OTP ────────────────────────────
    const { code, expiresAt } = generateOTP();
    console.log(`[send-otp] Generated OTP for user ${user.id}, expires: ${expiresAt.toISOString()}`);

    const { error: insertError } = await supabase
      .from('login_2fa_otp')
      .insert({
        user_id: user.id,
        email: user.email,
        code,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (insertError) {
      console.error('[send-otp] OTP insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate OTP.' },
        { status: 500 }
      );
    }

    // ── Step 4: Send OTP email ────────────────────────────────────────────
    try {
      const emailHtml = generateOTPEmailTemplate(code, user.email);
      await sendEmail(user.email, 'BPLO - Login OTP Verification Code', emailHtml);
    } catch (emailError) {
      console.error('[send-otp] Email error:', emailError);
      // Clean up the stored OTP since we cannot deliver it
      await supabase.from('login_2fa_otp').delete().eq('user_id', user.id);
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    // ── Step 5: Always return plain success — session never created here ──
    return NextResponse.json({
      message: isResend ? 'OTP resent successfully.' : 'OTP sent successfully.',
      email: user.email,
      userId: user.id,
    });

  } catch (error) {
    console.error('[send-otp] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createSessionToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, userId } = await request.json();

    if (!email || !otp || !userId) {
      return NextResponse.json(
        { error: 'Email, OTP, and user ID are required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Find valid OTP code
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
        { error: 'Invalid or expired OTP' },
        { status: 401 }
      );
    }

    // Don't mark OTP as used - keep it valid for 24 hours for subsequent logins
    // await supabase
    //   .from('login_2fa_otp')
    //   .update({ is_used: true })
    //   .eq('id', otpRecord.id);

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create session token
    const sessionToken = await createSessionToken(user.id, user.role);

    // Don't clean up OTP codes - keep them valid for 24 hours for subsequent logins
    // await supabase
    //   .from('login_2fa_otp')
    //   .delete()
    //   .eq('user_id', user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Database now has 'admin' and 'staff' directly
      },
      sessionToken,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in ms
    });

    // Set HTTP-only cookie with the user's role baked into the token
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
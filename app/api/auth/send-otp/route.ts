import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';
import { generateOTP, generateOTPEmailTemplate } from '@/lib/otpUtils';
import { sendEmail } from '@/lib/sendEmail';
import { createSessionToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isResend = false } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First validate credentials
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check for existing valid OTP (within 24 hours)
    console.log('Checking for existing valid OTP for user:', user.id);
    const { data: existingOtp, error: existingOtpError } = await supabase
      .from('login_2fa_otp')
      .select('*')
      .eq('user_id', user.id)
      .eq('email', user.email)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingOtp && !existingOtpError && !isResend) {
      console.log('Found existing valid OTP, creating session and logging in');
      
      // Create session token for direct login
      const sessionToken = await createSessionToken(user.id, user.role);
      
      const response = NextResponse.json({
        message: 'Login successful (using existing OTP)',
        user: {
          id: user.id,
          name: user.full_name || user.name,
          email: user.email,
          role: user.role,
        },
        sessionToken,
        expiresIn: 24 * 60 * 60 * 1000,
        existingOtp: true,
        loginSuccess: true
      });

      // Set HTTP-only cookie
      response.cookies.set('session-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    // Clean up any expired OTP codes for this user
    console.log('Cleaning up expired OTP codes for user:', user.id);
    const { error: deleteError } = await supabase
      .from('login_2fa_otp')
      .delete()
      .eq('user_id', user.id)
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.error('Delete error:', deleteError);
    } else {
      console.log('Successfully cleaned up existing OTP codes');
    }

    // Generate new OTP
    const { code, expiresAt } = generateOTP();
    console.log('Generated OTP:', code, 'expires at:', expiresAt.toISOString());

    // Store OTP in database
    console.log('Storing OTP for user:', user.id, 'email:', user.email);
    const { error: otpError } = await supabase
      .from('login_2fa_otp')
      .insert({
        user_id: user.id,
        email: user.email,
        code: code,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      console.error('OTP error details:', JSON.stringify(otpError, null, 2));
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    } else {
      console.log('OTP stored successfully in database');
    }

    // Send OTP email
    try {
      const emailHtml = generateOTPEmailTemplate(code, user.email);
      await sendEmail(user.email, 'BPLO - Login OTP Verification Code', emailHtml);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      email: user.email,
      userId: user.id
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

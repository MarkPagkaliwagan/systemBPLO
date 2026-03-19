import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

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

    // Check email verification status for new users
    // Grandfather existing users: if email_verified is null/undefined, consider them verified
    const needsEmailVerification = user.email_verified === false;

    if (needsEmailVerification) {
      // User needs to verify email first
      return NextResponse.json({
        message: 'Email verification required. Please check your email for the verification code.',
        user: {
          id: user.id,
          name: user.full_name || user.name,
          email: user.email,
          role: user.role,
        },
        requiresEmailVerification: true
      });
    }

    // Credentials are valid and email is verified (or grandfathered), return user info for OTP step
    return NextResponse.json({
      message: 'Credentials validated. OTP verification required.',
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        role: user.role,
      },
      requiresOTP: true
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
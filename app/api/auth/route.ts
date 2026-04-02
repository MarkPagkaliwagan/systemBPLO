// FILE: src/app/api/auth/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { comparePassword } from '@/lib/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
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
        { error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please try again.' },
        { status: 401 }
      );
    }
    if (user.is_disabled || user.status === 'inactive') {
      return NextResponse.json(
        { error: 'Your account has been disabled. Please contact your administrator.' },
        { status: 403 }
      );
    }
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    if (user.email_verified === false) {
      return NextResponse.json({
        requiresEmailVerification: true,
        user: mappedUser,
      });
    }
    return NextResponse.json({
      requiresOTP: true,
      user: mappedUser,
    });

  } catch (err) {
    console.error('[auth] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
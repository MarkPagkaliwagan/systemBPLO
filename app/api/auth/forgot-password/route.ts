import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // STEP 1: Test Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      return NextResponse.json({ error: 'SUPABASE ERROR', detail: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { message: 'If an account with this email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // STEP 2: Test token update
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: expiresAt.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'SUPABASE UPDATE ERROR', detail: updateError.message }, { status: 500 });
    }

    // STEP 3: Test email
    const resetUrl = `https://system-bplo-nxbj.vercel.app/reset-password?token=${resetToken}`;

    try {
      await sendEmail(
        user.email,
        'Password Reset Request',
        `<p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>`
      );
    } catch (emailError) {
      return NextResponse.json({ 
        error: 'EMAIL ERROR', 
        detail: emailError instanceof Error ? emailError.message : String(emailError)
      }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'If an account with this email exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json({ 
      error: 'UNEXPECTED ERROR', 
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
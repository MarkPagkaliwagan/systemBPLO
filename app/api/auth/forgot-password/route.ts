import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

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

    const resetUrl = `https://system-bplo-nxbj.vercel.app/reset-password?token=${resetToken}`;

    try {
      await sendEmail(
        user.email,
        'Password Reset Request',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name || user.email},</p>
          <p>Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #059669; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>`
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
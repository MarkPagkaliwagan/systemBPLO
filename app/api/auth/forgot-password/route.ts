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

    // Generate secure reset token
    const now = new Date();
    console.log('=== TOKEN CREATION DEBUG ===');
    console.log('Current Date:', now.toString());
    console.log('Current timestamp:', now.getTime());
    console.log('Expiration timestamp:', now.getTime() + (24 * 60 * 60 * 1000));
    console.log('========================');
    
    const resetToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      timestamp: now.getTime(),
      exp: now.getTime() + (24 * 60 * 60 * 1000) // 24 hours from now
    })).toString('base64');
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

   const resetUrl = `https://system-bplo.vercel.app/reset-password?token=${resetToken}`;

   try {
  await sendEmail(
    user.email,
    'Password Reset Request',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.6; color: #333;">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      
      <p style="margin: 0 0 10px 0;">Hello ${user.email},</p>
      
      <p style="margin: 0 0 20px 0;">Click the link below to reset your password:</p>

      <div style="margin: 25px 0;">
        <a href="${resetUrl}"
           style="background-color: #059669; color: white; padding: 12px 25px;
                  text-decoration: none; border-radius: 5px; font-weight: bold; 
                  display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="margin: 20px 0 5px 0;">This link will expire in 24 hours.</p>
      <p style="margin: 0;">If you didn't request this, please ignore this email.</p>
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
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateOTP } from '@/lib/otpUtils';
import { generateEmailVerificationTemplate } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and user ID are required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await supabase
      .from('email_verification_codes')
      .delete()
      .eq('user_id', user.id);

    const { code, expiresAt } = generateOTP();

    const { error: otpError } = await supabase
      .from('email_verification_codes')
      .insert({
        user_id: user.id,
        email: user.email,
        code: code,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }
    try {
      const emailHtml = generateEmailVerificationTemplate(code, user.email);
      await sendEmail(user.email, 'BPLO - Email Verification Code', emailHtml);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
      email: user.email,
      userId: user.id
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

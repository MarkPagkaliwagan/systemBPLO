import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateVerificationSuccessTemplate } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/sendEmail';
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
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Find valid OTP code
    const { data: otpRecord, error: otpError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .eq('code', otp)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabase
      .from('email_verification_codes')
      .update({ is_used: true })
      .eq('id', otpRecord.id);

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

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating email verification:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Clean up any old email verification codes for this user
    await supabase
      .from('email_verification_codes')
      .delete()
      .eq('user_id', user.id);

    // Create session token for consistent authentication
    const sessionToken = await createSessionToken(user.id, user.role);

    // Send verification success email
    try {
      const successEmailHtml = generateVerificationSuccessTemplate(user.full_name || user.email);
      await sendEmail(user.email, 'Email Successfully Verified - BPLO', successEmailHtml);
    } catch (emailError) {
      console.error('Success email error:', emailError);
      // Don't fail the verification if email fails
    }

    const response = NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        role: user.role,
      },
      sessionToken,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in ms
      verified: true
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
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

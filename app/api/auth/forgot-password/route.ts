import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Input validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      // Don't reveal if user exists or not for security
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

    // Store reset token in database (you'll need to add these columns to users table)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to store reset token:', updateError);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Send reset email
    try {
      await sendEmail(
        user.email,
        'Password Reset Request',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; margin-bottom: 20px;">
            Hello ${user.name || user.email},
          </p>
          <p style="color: #666; margin-bottom: 20px;">
            We received a request to reset your password for the BPLO Inspection Management System. 
            Click the link below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #059669; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #666; margin-bottom: 20px;">
            If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged.
          </p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from BPLO Inspection Management System.
          </p>
        </div>`
      );
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'If an account with this email exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword } from '@/lib/passwordUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== REQUEST BODY DEBUG ===');
    console.log('Received body:', body);
    
    const { token, newPassword } = body;

    // Input validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Decode and validate reset token
    console.log('=== RESET TOKEN DEBUG ===');
    console.log('Received token:', token);
    
    let tokenData;
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      console.log('Decoded token string:', decoded);
      tokenData = JSON.parse(decoded);
      console.log('Parsed token data:', tokenData);
    } catch (error) {
      console.log('Token decode error:', error);
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check token expiration
    const currentTime = Date.now();
    const tokenExpiration = parseInt(tokenData.exp);
    
    console.log('=== EXPIRATION DEBUG ===');
    console.log('Current time:', currentTime);
    console.log('Token expiration:', tokenExpiration);
    console.log('Is expired:', currentTime > tokenExpiration);
    console.log('========================');
    
    if (currentTime > tokenExpiration) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', tokenData.email)
      .eq('password_reset_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is still valid (not expired in database)
    if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Hash new password before storing
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedNewPassword,
        password_reset_token: null,
        password_reset_expires: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password reset error:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
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

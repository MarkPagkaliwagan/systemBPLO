import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifySessionToken } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {

    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ valid: false, error: 'No session token found' }, { status: 401 });
    }
    const sessionData = await verifySessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired session token' }, { status: 401 });
    }
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, email_verified')
      .eq('id', sessionData.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ valid: false, error: 'User not found' }, { status: 404 });
    }

    if (user.email_verified === false) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Email verification required',
        requiresEmailVerification: true 
      }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

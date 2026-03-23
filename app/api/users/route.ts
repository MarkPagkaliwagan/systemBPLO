import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword } from '@/lib/passwordUtils';
import { validatePassword, generateSecurePassword } from '@/lib/clientPasswordUtils';
import { generateWelcomeEmailTemplate } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

// Helper function to validate user role
async function validateUserRole(request: NextRequest): Promise<{ valid: boolean; userRole?: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false };
    }

    const sessionToken = authHeader.substring(7);
    
    // Parse the new token format: payload.signature
    const [payloadB64, signature] = sessionToken.split('.');
    if (!payloadB64 || !signature) {
      return { valid: false };
    }
    
    const sessionData = JSON.parse(atob(payloadB64));
    // Check session expiration
    if (Date.now() > sessionData.exp) {
      return { valid: false };
    }

    return { 
      valid: true, 
      userRole: sessionData.role 
    };
  } catch (error) {
    return { valid: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate user role - only admin can access user management
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.full_name, // Map full_name to name for frontend
      email: user.email,
      contact_no: user.contact_no,
      role: user.role,
      email_verified: user.email_verified,
      createdAt: user.created_at
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate user role - only admin can create users
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, contact_no, role } = body;

    // Basic validation
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Generate secure password if not provided
    const finalPassword = password || generateSecurePassword();

    // Password strength validation (if password provided)
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: passwordValidation.message },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(finalPassword);

    // Generate password reset token for new user
    const resetToken = Buffer.from(JSON.stringify({
      userId: crypto.randomUUID(), // Temporary ID, will be replaced after user creation
      email: email,
      timestamp: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    })).toString('base64');

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          full_name: name, // Map name to full_name column
          email,
          password: hashedPassword, // Store hashed password
          contact_no: contact_no || null,
          role,
          email_verified: false, // New users need to verify email
          password_reset_token: resetToken,
          password_reset_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Update reset token with actual user ID
    const updatedResetToken = Buffer.from(JSON.stringify({
      userId: newUser.id,
      email: email,
      timestamp: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000)
    })).toString('base64');

    await supabase
      .from('users')
      .update({
        password_reset_token: updatedResetToken
      })
      .eq('id', newUser.id);

    // Send welcome email with reset password link
    try {
      const resetUrl = `https://system-bplo.vercel.app/reset-password?token=${updatedResetToken}`;
      const welcomeEmailHtml = generateWelcomeEmailTemplate(name, email, finalPassword, resetUrl);
      
      await sendEmail(email, 'Welcome to BPLO Inspection Management System', welcomeEmailHtml);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail the user creation if email fails, but log it
    }

    // Transform response to match expected format
    const transformedUser = {
      id: newUser.id,
      name: newUser.full_name, // Map full_name to name for frontend
      email: newUser.email,
      contact_no: newUser.contact_no,
      role: newUser.role,
      createdAt: newUser.created_at
    };

    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate user role - only admin can update users
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, email, contact_no, role } = body;

    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { error: 'ID, name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email) {
      const { data: emailCheck } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (emailCheck) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: name,
        email,
        contact_no: contact_no || null,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Transform response to match expected format
    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.full_name,
      email: updatedUser.email,
      contact_no: updatedUser.contact_no,
      role: updatedUser.role,
      createdAt: updatedUser.created_at
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate user role - only admin can delete users
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

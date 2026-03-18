import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword, validatePassword } from '@/lib/passwordUtils';

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
    // Validate user role - only super_admin can access user management
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin privileges required.' },
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
      role: user.role,
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
    // Validate user role - only super_admin can create users
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
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
    const hashedPassword = await hashPassword(password);

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          full_name: name, // Map name to full_name column
          email,
          password: hashedPassword, // Store hashed password
          role,
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

    // Transform response to match expected format
    const transformedUser = {
      id: newUser.id,
      name: newUser.full_name, // Map full_name to name for frontend
      email: newUser.email,
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

export async function DELETE(request: NextRequest) {
  try {
    // Validate user role - only super_admin can delete users
    const { valid, userRole } = await validateUserRole(request);
    if (!valid || userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin privileges required.' },
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

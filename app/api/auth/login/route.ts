export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { initializeDatabase } from '@/lib/db-init';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeDatabase();

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const db = getDatabase();
    const user = await db.users.getByEmail(email);

    if (!user) {
      console.log('User not found:', email);
      console.log('Available users:', (await db.users.getAll()).map((u: any) => u.email));
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email, 'Role:', user.role);
    console.log('Stored hash:', user.password);

    // Verify password using bcrypt directly
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    console.log('Login successful for:', email);
    console.log('Token generated:', token.substring(0, 20) + '...');

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set auth cookie
    const cookieValue = setAuthCookie(token);
    console.log('Setting cookie:', cookieValue.substring(0, 50) + '...');
    response.headers.set('Set-Cookie', cookieValue);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

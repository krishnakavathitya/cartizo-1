export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { initializeDatabase } from '@/lib/db-init';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth-utils';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logApiRequest(request, 'Login Attempt');
    // Ensure database is initialized
    await initializeDatabase();

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      logApiResponse(request, 400, { error: 'Invalid request body' });
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
      logApiResponse(request, 400, { error: 'Email and password are required' });
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
      logApiResponse(request, 401, { error: 'Invalid email or password' });
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
      logApiResponse(request, 401, { error: 'Invalid email or password' });
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
        loginTime: new Date().toISOString(),
      },
    });

    // Set auth cookie
    const cookieValue = setAuthCookie(token);
    console.log('Setting cookie:', cookieValue.substring(0, 50) + '...');
    response.headers.set('Set-Cookie', cookieValue);

    logApiResponse(request, 200, { success: true, email: user.email });
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Stack:', error.stack);
    logApiError(request, error, 'Login Error');
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

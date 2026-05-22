import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { hashPassword, validatePassword, validateEmail } from '@/lib/password-utils';
import { generateToken, setAuthCookie } from '@/lib/auth-utils';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logApiRequest(request, 'Registration Attempt');
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      logApiResponse(request, 400, { error: 'Name, email, and password are required' });
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      logApiResponse(request, 400, { error: 'Invalid email format' });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logApiResponse(request, 400, { error: passwordValidation.message });
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const db = getDatabase();
    const existingUser = await db.users.getByEmail(email);

    if (existingUser) {
      logApiResponse(request, 409, { error: 'Email already registered' });
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        loginTime: new Date().toISOString(),
      },
    });

    // Set auth cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    logApiResponse(request, 200, { success: true, email: newUser.email }, 'Registration Successful');
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    logApiError(request, error, 'Registration Error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDatabase } from '@/lib/db';
import { generateToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Google callback handler triggered');

    // Get NextAuth session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log('❌ No session found');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    console.log('✅ Session found for:', session.user.email);

    // Get user from database
    const db = getDatabase();
    const user = await db.users.getByEmail(session.user.email);

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    console.log('✅ User found in database:', user.email);

    // Create JWT token for your existing auth system
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    console.log('✅ JWT token generated');

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/', request.url));

    // Set the auth-token cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Cookie set, redirecting to homepage');

    return response;
  } catch (error) {
    console.error('❌ Google callback error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

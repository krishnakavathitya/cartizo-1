import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/auth-utils';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const pathname = request.nextUrl.pathname;

  console.log('Middleware check:', pathname, 'Token exists:', !!token);

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      console.log('No token, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const user = await verifyTokenEdge(token);
    console.log('Admin route - User:', user);

    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check if accessing account routes
  if (pathname.startsWith('/account')) {
    if (!token) {
      console.log('❌ No token for account route, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const user = await verifyTokenEdge(token);
      console.log('✅ Account route - User verified:', user?.email);

      if (!user) {
        console.log('❌ Invalid token, redirecting to login');
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Check if accessing profile routes
  if (pathname.startsWith('/profile')) {
    if (!token) {
      console.log('No token for profile, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const user = await verifyTokenEdge(token);
    console.log('Profile route - User:', user);

    if (!user) {
      console.log('Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/profile/:path*', '/dashboard/:path*'],
};

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const TOKEN_NAME = 'auth-token';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify JWT token for Edge Runtime (Middleware)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Edge token verification failed:', error);
    return null;
  }
}

/**
 * Get token from cookies (server-side)
 */
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME);
    return token?.value || null;
  } catch (error) {
    console.log('Could not access cookies (this is normal in some contexts)');
    return null;
  }
}

/**
 * Get current user from token (server-side)
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.log('Could not get current user (this is normal when not authenticated)');
    return null;
  }
}

/**
 * Set auth cookie (use in API routes)
 */
export function setAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const isProduction = process.env.NODE_ENV === 'production';

  // For localhost, don't use Secure flag
  if (isProduction) {
    return `${TOKEN_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
  } else {
    return `${TOKEN_NAME}=${token}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
  }
}

/**
 * Clear auth cookie (use in API routes)
 */
export function clearAuthCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return `${TOKEN_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
  } else {
    return `${TOKEN_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: JWTPayload | null): boolean {
  return user !== null;
}

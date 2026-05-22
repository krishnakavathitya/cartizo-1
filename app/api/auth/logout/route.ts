import { NextResponse, NextRequest } from 'next/server';
import { clearAuthCookie } from '@/lib/auth-utils';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logApiRequest(request, 'Logout Attempt');
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear auth cookie
    response.headers.set('Set-Cookie', clearAuthCookie());

    logApiResponse(request, 200, { success: true }, 'Logout Successful');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    logApiError(request, error, 'Logout Error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

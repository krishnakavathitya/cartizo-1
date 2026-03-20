export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // This is expected when not logged in - not an error
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch fresh data from database to get updated name and photo
    const { getDatabase } = require('@/lib/db');
    const db = getDatabase();
    const freshUser = db.users.getById(user.userId);

    return NextResponse.json({
      user: {
        id: user.userId,
        name: freshUser?.name || user.name,
        email: user.email,
        role: user.role,
        photo: freshUser?.photo,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

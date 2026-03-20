import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth-utils';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get current user to check for avatar
    const db = getDatabase();
    const user = await db.users.getById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete avatar file if exists
    if (user.avatar && typeof user.avatar === 'string' && user.avatar.startsWith('/uploads/avatars/')) {
      const filepath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (error) {
          console.error('Error deleting avatar:', error);
        }
      }
    }

    // Remove avatar from database
    const updatedUser = await db.users.update(decoded.userId, { avatar: null });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
      },
    });
  } catch (error: any) {
    console.error('Remove avatar error:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove avatar' }, { status: 500 });
  }
}

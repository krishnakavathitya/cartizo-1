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

    const body = await request.json();
    const { avatar } = body;

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar data is required' }, { status: 400 });
    }

    // Extract the base64 data and mime type
    const matches = avatar.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Validate mime type
    const allowedTypes = ['jpeg', 'jpg', 'png', 'webp'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed' }, { status: 400 });
    }

    // Check file size (2MB limit)
    const sizeInBytes = Buffer.from(base64Data, 'base64').length;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 2) {
      return NextResponse.json({ error: 'Image size must be less than 2MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get current user to check for old avatar
    const db = getDatabase();
    const user = await db.users.getById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete old avatar if exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldFilepath = path.join(process.cwd(), 'public', user.avatar);
      if (fs.existsSync(oldFilepath)) {
        try {
          fs.unlinkSync(oldFilepath);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
        }
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    const filename = `avatar-${decoded.userId}-${timestamp}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save the file
    fs.writeFileSync(filepath, base64Data, 'base64');

    // Return the public URL
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user with new avatar URL
    const updatedUser = await db.users.update(decoded.userId, { avatar: avatarUrl });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
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
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload avatar' }, { status: 500 });
  }
}

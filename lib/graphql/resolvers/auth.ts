import bcrypt from 'bcryptjs';
import { GraphQLContext, requireAuth } from '../context';
import { ValidationError } from '../errors';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Helper function to save base64 image
function saveBase64Image(base64String: string, userId: number): string {
  try {
    // Extract the base64 data and mime type
    const matches = base64String.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ValidationError('Invalid image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Validate mime type
    const allowedTypes = ['jpeg', 'jpg', 'png'];
    if (!allowedTypes.includes(mimeType.toLowerCase())) {
      throw new ValidationError('Only JPG, JPEG, and PNG images are allowed');
    }

    // Check file size (2MB limit)
    const sizeInBytes = Buffer.from(base64Data, 'base64').length;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 2) {
      throw new ValidationError('Image size must be less than 2MB');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `avatar-${userId}-${timestamp}.${mimeType === 'jpeg' ? 'jpg' : mimeType}`;
    const filepath = path.join(uploadsDir, filename);

    // Save the file
    fs.writeFileSync(filepath, base64Data, 'base64');

    // Return the public URL
    return `/uploads/avatars/${filename}`;
  } catch (error: any) {
    console.error('Error saving avatar:', error);
    throw new ValidationError(error.message || 'Failed to save avatar');
  }
}

// Helper function to delete old avatar
function deleteOldAvatar(avatarUrl: string): void {
  try {
    if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;

    const filepath = path.join(process.cwd(), 'public', avatarUrl);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting old avatar:', error);
    // Don't throw error, just log it
  }
}

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) return null;
      const db = getDatabase();
      return (await db.users.getById(context.user.id as any)) || null;
    },
  },
  Mutation: {
    signup: async (
      _: any,
      { input }: { input: { email: string; name: string; password: string } },
      context: GraphQLContext
    ) => {
      if (!input.email || !input.name || !input.password) {
        throw new ValidationError('All fields are required');
      }
      if (input.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }
      const db = getDatabase();
      const existingUser = await db.users.getByEmail(input.email);
      if (existingUser) {
        throw new ValidationError('Email already in use');
      }
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await db.users.create({
        email: input.email,
        name: input.name,
        password: hashedPassword,
        role: 'customer',
      });
      return { user, token: 'use-nextauth-session' };
    },

    login: async (
      _: any,
      { input }: { input: { email: string; password: string } },
      context: GraphQLContext
    ) => {
      const db = getDatabase();
      const user = await db.users.getByEmail(input.email);
      if (!user) throw new ValidationError('Invalid email or password');

      const isPasswordValid = await bcrypt.compare(input.password, user.password);
      if (!isPasswordValid) throw new ValidationError('Invalid email or password');

      return { user, token: 'use-nextauth-session' };
    },

    updatePassword: async (
      _: any,
      { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
      context: GraphQLContext
    ) => {
      const authUser = requireAuth(context);
      const db = getDatabase();
      const user = await db.users.getById(authUser.id);

      if (!user) throw new ValidationError('User not found');

      if (!newPassword || newPassword.length < 6) {
        throw new ValidationError('New password must be at least 6 characters');
      }

      if (newPassword === currentPassword) {
        throw new ValidationError('New password must be different from the current password');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) throw new ValidationError('Current password is incorrect');

      // Hash new password and save
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.users.update(user.id, { password: hashedPassword });
      return true;
    },

    updateProfile: async (
      _: any,
      { name, phone }: { name?: string; phone?: string },
      context: GraphQLContext
    ) => {
      const authUser = requireAuth(context);
      const db = getDatabase();

      const updates: any = {};
      if (name) updates.name = name;
      if (phone !== undefined) updates.phone = phone;

      const updated = await db.users.update(authUser.id, updates);
      if (!updated) throw new ValidationError('User not found');

      return updated;
    },

    uploadAvatar: async (
      _: any,
      { avatar }: { avatar: string },
      context: GraphQLContext
    ) => {
      const authUser = requireAuth(context);
      const db = getDatabase();

      // Get current user to check for old avatar
      const user = await db.users.getById(authUser.id);
      if (!user) throw new ValidationError('User not found');

      // Delete old avatar if exists
      if (user.avatar) {
        deleteOldAvatar(user.avatar);
      }

      // Save new avatar
      const avatarUrl = saveBase64Image(avatar, authUser.id);

      // Update user with new avatar URL
      const updated = await db.users.update(authUser.id, { avatar: avatarUrl });
      if (!updated) throw new ValidationError('Failed to update avatar');

      return updated;
    },

    removeAvatar: async (
      _: any,
      __: any,
      context: GraphQLContext
    ) => {
      const authUser = requireAuth(context);
      const db = getDatabase();

      // Get current user to check for avatar
      const user = await db.users.getById(authUser.id);
      if (!user) throw new ValidationError('User not found');

      // Delete avatar file if exists
      if (user.avatar) {
        deleteOldAvatar(user.avatar);
      }

      // Remove avatar from database
      const updated = await db.users.update(authUser.id, { avatar: null });
      if (!updated) throw new ValidationError('Failed to remove avatar');

      return updated;
    },
  },

  User: {
    role: (u: any) => (u.role || 'CUSTOMER').toUpperCase(),
    phone: (u: any) => u.phone || '',
  }
};


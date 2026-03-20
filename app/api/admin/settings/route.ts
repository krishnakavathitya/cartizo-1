import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function PATCH(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { email, currentPassword, newPassword } = await request.json();

        const db = getDatabase();
        const adminUser = await db.users.getById(currentUser.userId);
        if (!adminUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, adminUser.password);
        if (!passwordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        const updates: any = {};
        if (email && email !== adminUser.email) updates.email = email;
        if (newPassword) {
            updates.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No changes made' });
        }

        await db.users.update(currentUser.userId, updates);

        return NextResponse.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const db = getDatabase();
        const orders = await db.orders.getAllAdmin();
        const users = await db.users.getAll();

        // Filter out orders from deleted users and map user data
        const ordersWithUser = orders
            .map((o: any) => {
                const orderUser = users.find((u: any) => u.id === o.userId);
                
                // Return null if user doesn't exist (deleted user)
                if (!orderUser) {
                    return null;
                }
                
                return {
                    ...o,
                    userName: orderUser.name,
                    userEmail: orderUser.email,
                };
            })
            .filter((o: any) => o !== null); // Remove null entries (deleted users)

        return NextResponse.json({ orders: ordersWithUser.reverse() });
    } catch (error) {
        console.error('Admin orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

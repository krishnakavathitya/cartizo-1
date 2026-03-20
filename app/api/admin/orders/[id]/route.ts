import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { getDatabase } from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { status } = await request.json();
        const validStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const db = getDatabase();

        // Find the order first to get the userId
        const allOrders = await db.orders.getAllAdmin();
        const orderToUpdate = allOrders.find((o: any) => o.id === params.id);

        if (!orderToUpdate) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const updatedOrder = await db.orders.updateStatus(orderToUpdate.userId, params.id, status);

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

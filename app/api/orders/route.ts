import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { getDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT token
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Get orders from database
    const db = getDatabase();
    const userOrders = await db.orders.getAll(currentUser.userId);

    return NextResponse.json({
      success: true,
      total: userOrders.length,
      orders: userOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, totalAmount, status } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in order' },
        { status: 400 }
      );
    }

    // Create order object matching SQLite schema expected by db.orders.create
    const orderData = {
      orderNumber: `ORD-${Date.now()}-${currentUser.userId}`,
      total: totalAmount,
      items: items, // db.orders.create handles stringifying this
      status: status || 'PENDING',
    };

    // Save to database
    const db = getDatabase();
    const order = await db.orders.create(currentUser.userId, orderData);

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

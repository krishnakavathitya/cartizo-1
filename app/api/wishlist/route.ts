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

    const db = getDatabase();
    // Fetch real wishlist from DB
    const wishlistItems = await db.wishlist.getAll(currentUser.userId);

    // Enrich wishlist with product details
    const enrichedItems = await Promise.all(wishlistItems.map(async (item: any) => {
      const product = await db.products.getById(item.productId);
      return {
        ...item,
        productName: product?.name || 'Unknown Product',
        productImage: product?.image || '/image.png',
        price: product?.price || 0,
        discount: product?.discount || 0,
        inStock: product?.inStock || false,
      };
    }));

    return NextResponse.json({
      success: true,
      total: enrichedItems.length,
      items: enrichedItems,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

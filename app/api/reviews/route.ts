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
    // Fetch real reviews from DB
    const reviews = await db.reviews.getByUser(currentUser.userId);

    // Enrich reviews with product info
    const enrichedReviews = await Promise.all(reviews.map(async (review: any) => {
      const product = await db.products.getById(review.productId);
      return {
        ...review,
        productName: product?.name || 'Unknown Product',
      };
    }));

    return NextResponse.json({
      success: true,
      total: enrichedReviews.length,
      reviews: enrichedReviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

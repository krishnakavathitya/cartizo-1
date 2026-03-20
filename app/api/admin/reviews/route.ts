import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth-utils';

// GET all reviews (admin only)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user || user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const db = getDatabase();

        // Fetch all reviews
        const reviews = await db.reviews.getAllReviews();

        // Enrich with user and product data
        const enriched = await Promise.all(
            reviews.map(async (r: any) => {
                const reviewUser = await db.users.getById(r.userId);
                const product = await db.products.getById(r.productId);
                return {
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    user: reviewUser
                        ? { id: reviewUser.id, name: reviewUser.name, email: reviewUser.email }
                        : null,
                    product: product
                        ? { id: product.id, title: product.name, slug: product.slug }
                        : null,
                };
            })
        );

        return NextResponse.json({ reviews: enriched });
    } catch (error) {
        console.error('Admin reviews error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE a review (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user || user.role?.toLowerCase() !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { reviewId } = await request.json();
        if (!reviewId) {
            return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
        }

        const db = getDatabase();
        const success = await db.reviews.delete(reviewId);

        return NextResponse.json({ success });
    } catch (error) {
        console.error('Delete review error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

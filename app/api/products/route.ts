import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';
import { logApiRequest, logApiResponse, logApiError } from '@/lib/logger';

// GET all products
export async function GET(request: NextRequest) {
  try {
    logApiRequest(request);
    const db = getDatabase();
    const products = await db.products.getAll();

    logApiResponse(request, 200);
    return NextResponse.json({ products });
  } catch (error) {
    logApiError(request, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    logApiRequest(request);
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      logApiResponse(request, 403, { error: 'Unauthorized' });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      name,
      slug,
      brand,
      category,
      price,
      discount = 0,
      description = '',
      specifications = '{}',
      image = '',
      inStock = true,
      stock = 100,
    } = data;

    // Validate required fields
    if (!name || !slug || !brand || !category || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if slug already exists
    const existing = await db.products.getBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409 }
      );
    }

    // Insert product
    const product = await db.products.create({
      name,
      slug,
      brand,
      category,
      price,
      discount,
      description,
      specifications,
      image,
      averageRating: 0,
      reviewCount: 0,
      inStock,
      stock,
    });

    logApiResponse(request, 201);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logApiError(request, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

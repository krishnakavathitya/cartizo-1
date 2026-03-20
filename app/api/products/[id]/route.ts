import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const product = await db.products.getById(parseInt(params.id));

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const db = getDatabase();
    const productId = parseInt(params.id);

    // Check if product exists
    const existing = await db.products.getById(productId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another product
    if (data.slug) {
      const slugTaken = await db.products.getBySlug(data.slug);
      if (slugTaken && slugTaken.id !== productId) {
        return NextResponse.json(
          { error: 'Slug already taken by another product' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.specifications !== undefined) updateData.specifications = data.specifications;
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.stock !== undefined) updateData.stock = data.stock;

    // Handle images - support both single 'image' (from edit page) and 'images' array
    if (data.image !== undefined) {
      updateData.image = data.image;
    } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // If images array is provided, extract URL from first item (object or string)
      const firstImage = data.images[0];
      updateData.image = typeof firstImage === 'object' ? firstImage.url : firstImage;
    }

    // Update product
    const product = await db.products.update(productId, updateData);

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const db = getDatabase();
    const productId = parseInt(params.id);

    // Check if product exists
    const existing = await db.products.getById(productId);
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    const success = await db.products.delete(productId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

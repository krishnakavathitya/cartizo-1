import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth-utils';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const db = getDatabase();
        const categories = await db.categories.getAll();
        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { name } = await request.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: 'Category name required' }, { status: 400 });
        }

        const db = getDatabase();
        const categories = await db.categories.getAll();
        if (categories.includes(name.trim())) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
        }

        categories.push(name.trim());
        categories.sort();
        await db.categories.update(categories);

        return NextResponse.json({ categories }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { name } = await request.json();
        const db = getDatabase();
        let categories = await db.categories.getAll();
        const before = categories.length;
        categories = categories.filter((c) => c !== name);

        if (categories.length === before) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        await db.categories.update(categories);
        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

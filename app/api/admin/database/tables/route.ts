import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const db = await open({
            filename: path.join(process.cwd(), 'database.sqlite'),
            driver: sqlite3.Database
        });

        const tables = await db.all(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        );

        await db.close();

        return NextResponse.json({ 
            tables: tables.map(t => t.name)
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

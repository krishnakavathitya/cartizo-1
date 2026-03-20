import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const tableName = searchParams.get('name');

        if (!tableName) {
            return NextResponse.json({ error: 'Table name required' }, { status: 400 });
        }

        const db = await open({
            filename: path.join(process.cwd(), 'database.sqlite'),
            driver: sqlite3.Database
        });

        // Get table data
        const rows = await db.all(`SELECT * FROM ${tableName} LIMIT 1000`);
        
        // Get column names
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        await db.close();

        return NextResponse.json({ 
            rows,
            columns,
            count: rows.length
        });
    } catch (error) {
        console.error('Error fetching table data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

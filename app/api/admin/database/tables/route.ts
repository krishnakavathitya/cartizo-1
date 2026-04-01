import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await pool.query(
            "SELECT tablename as name FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );

        return NextResponse.json({ 
            tables: result.rows.map(t => t.name)
        });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

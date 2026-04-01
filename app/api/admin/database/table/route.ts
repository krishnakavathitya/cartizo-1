import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
import { pool } from '@/lib/db';

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

        // Use parameterized query for safety if possible, or validate table name
        // Note: Table names cannot be easily parameterized in standard SQL drivers like pg, but we can validate against known tables
        const validTablesResult = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        const validTables = validTablesResult.rows.map(t => t.tablename);
        
        if (!validTables.includes(tableName)) {
            return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
        }

        const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 1000`);
        const rows = result.rows;
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

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

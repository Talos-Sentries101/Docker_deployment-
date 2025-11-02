import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: 'letushack_db'
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        lab_id,
        lab_name,
        lab_description,
        lab_tags,
        level,
        max_score,
        created_at,
        updated_at
      FROM labs
      ORDER BY level ASC, created_at DESC
    `);

    return NextResponse.json({
      success: true,
      labs: result.rows
    });
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch labs' },
      { status: 500 }
    );
  }
}

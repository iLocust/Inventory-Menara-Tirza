import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET all schools
export async function GET() {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    
    // Get schools with kepala sekolah information
    const schools = await db.all(`
      SELECT s.*, u.name as kepala_sekolah_name 
      FROM schools s
      LEFT JOIN users u ON s.kepala_sekolah_id = u.id
      ORDER BY s.name ASC
    `);
    
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { message: 'Failed to fetch schools', error: error.message },
      { status: 500 }
    );
  }
}

// POST new school
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'School name is required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    const result = await db.run(
      `INSERT INTO schools (name, address, phone, email, kepala_sekolah_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.name,
        body.address || '',
        body.phone || '',
        body.email || '',
        body.kepala_sekolah_id || null
      ]
    );
    
    const newSchool = await db.get('SELECT * FROM schools WHERE id = ?', result.lastID);
    
    return NextResponse.json(newSchool, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { message: 'Failed to create school', error: error.message },
      { status: 500 }
    );
  }
}
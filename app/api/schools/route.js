import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';

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
    
    // For each school without a kepala_sekolah, try to find and assign one
    for (const school of schools) {
      if (!school.kepala_sekolah_id) {
        // Find a user with matching school_id and 'kepala_sekolah' role
        const kepalaSekolah = await db.get(`
          SELECT id, name 
          FROM users 
          WHERE school_id = ? AND role = 'kepala_sekolah'
          LIMIT 1
        `, school.id);
        
        if (kepalaSekolah) {
          // Update the school with the found kepala_sekolah_id
          await db.run(
            'UPDATE schools SET kepala_sekolah_id = ? WHERE id = ?',
            [kepalaSekolah.id, school.id]
          );
          
          // Update the returned data
          school.kepala_sekolah_id = kepalaSekolah.id;
          school.kepala_sekolah_name = kepalaSekolah.name;
        }
      }
    }
    
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
    // Check user authorization
    const user = await getCurrentUser();
    
    // Return unauthorized if the user is a kepala_sekolah
    if (user && user.role === 'kepala_sekolah') {
      return NextResponse.json(
        { message: 'Kepala Sekolah tidak memiliki akses untuk menambahkan sekolah baru' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'School name is required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Create the school first
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
    
    const newSchoolId = result.lastID;
    
    // If no kepala_sekolah_id was provided, try to find a matching one
    if (!body.kepala_sekolah_id) {
      // Find a user with matching school_id and 'kepala_sekolah' role
      const kepalaSekolah = await db.get(`
        SELECT id, name 
        FROM users 
        WHERE school_id = ? AND role = 'kepala_sekolah'
        LIMIT 1
      `, newSchoolId);
      
      if (kepalaSekolah) {
        // Update the school with the found kepala_sekolah_id
        await db.run(
          'UPDATE schools SET kepala_sekolah_id = ? WHERE id = ?',
          [kepalaSekolah.id, newSchoolId]
        );
      }
    }
    
    // Get the complete school data including the kepala_sekolah name
    const newSchool = await db.get(`
      SELECT s.*, u.name as kepala_sekolah_name 
      FROM schools s
      LEFT JOIN users u ON s.kepala_sekolah_id = u.id
      WHERE s.id = ?
    `, newSchoolId);
    
    return NextResponse.json(newSchool, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { message: 'Failed to create school', error: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';

// Helper function to get a school by ID
async function getSchoolById(id) {
  const db = await openDb();
  return db.get(`
    SELECT s.*, u.name as kepala_sekolah_name
    FROM schools s
    LEFT JOIN users u ON s.kepala_sekolah_id = u.id
    WHERE s.id = ?
  `, id);
}

// GET single school
export async function GET(request, { params }) {
  try {
    const id = params.id;
    const school = await getSchoolById(id);
    
    if (!school) {
      return NextResponse.json(
        { message: 'School not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(school);
  } catch (error) {
    console.error(`Error fetching school ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch school', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) school
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    
    // Check user authorization
    const user = await getCurrentUser();
    
    // Get the school to check if it exists
    const school = await getSchoolById(id);
    
    if (!school) {
      return NextResponse.json(
        { message: 'School not found' },
        { status: 404 }
      );
    }
    
    // Return unauthorized if the user is a kepala_sekolah but not assigned to this school
    if (user && user.role === 'kepala_sekolah' && user.school_id !== school.id) {
      return NextResponse.json(
        { message: 'Kepala Sekolah hanya dapat mengedit sekolah yang ditugaskan kepadanya' },
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
    
    await db.run(
      `UPDATE schools SET 
        name = ?, 
        address = ?, 
        phone = ?, 
        email = ?,
        kepala_sekolah_id = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        body.name,
        body.address || '',
        body.phone || '',
        body.email || '',
        body.kepala_sekolah_id || null,
        id
      ]
    );
    
    const updatedSchool = await getSchoolById(id);
    
    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error(`Error updating school ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update school', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE school
export async function DELETE(request, { params }) {
  try {
    // Check user authorization
    const user = await getCurrentUser();
    
    // Return unauthorized if the user is a kepala_sekolah
    if (user && user.role === 'kepala_sekolah') {
      return NextResponse.json(
        { message: 'Kepala Sekolah tidak memiliki akses untuk menghapus sekolah' },
        { status: 403 }
      );
    }
    
    const id = params.id;
    
    // Check if school exists
    const school = await getSchoolById(id);
    
    if (!school) {
      return NextResponse.json(
        { message: 'School not found' },
        { status: 404 }
      );
    }
    
    const db = await openDb();
    await db.run('DELETE FROM schools WHERE id = ?', id);
    
    return NextResponse.json(
      { message: `School ${id} deleted successfully` }
    );
  } catch (error) {
    console.error(`Error deleting school ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete school', error: error.message },
      { status: 500 }
    );
  }
}
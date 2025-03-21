import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';
import { canAccessSchool } from '../../../lib/school-access';

// GET all rooms with related data
export async function GET(request) {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('school_id');
    
    let query = `
      SELECT
        r.*,
        s.name as school_name,
        rs.name as status_name,
        rt.name as type_name,
        u.name as responsible_user_name,
        u.id as responsible_user_id
      FROM
        rooms r
      LEFT JOIN schools s ON r.school_id = s.id
      LEFT JOIN room_statuses rs ON r.status_id = rs.id
      LEFT JOIN room_types rt ON r.type_id = rt.id
      LEFT JOIN users u ON r.responsible_user_id = u.id
    `;
    
    const params = [];
    
    // Add filter condition if schoolId is provided
    if (schoolId) {
      query += ' WHERE r.school_id = ?';
      params.push(schoolId);
    }
    
    query += ' ORDER BY r.school_id, r.name';
    
    const rooms = await db.all(query, params);
    
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { message: 'Failed to fetch rooms', error: error.message },
      { status: 500 }
    );
  }
}

// POST new room
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check if user has access to the school
    const hasAccess = await canAccessSchool(body.school_id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to create rooms for this school' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!body.name || !body.school_id || !body.type_id) {
      return NextResponse.json(
        { message: 'Room name, school_id, and type_id are required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Verify that the referenced school exists
    const schoolExists = await db.get('SELECT id FROM schools WHERE id = ?', body.school_id);
    if (!schoolExists) {
      return NextResponse.json(
        { message: 'Referenced school does not exist' },
        { status: 400 }
      );
    }
    
    // Verify that the room type exists
    const typeExists = await db.get('SELECT id FROM room_types WHERE id = ?', body.type_id);
    if (!typeExists) {
      return NextResponse.json(
        { message: 'Referenced room type does not exist' },
        { status: 400 }
      );
    }
    
    // If a responsible user is provided, verify they exist
    if (body.responsible_user_id) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', body.responsible_user_id);
      if (!userExists) {
        return NextResponse.json(
          { message: 'Referenced responsible user does not exist' },
          { status: 400 }
        );
      }
    }
    
    const result = await db.run(
      `INSERT INTO rooms (
        name, 
        school_id, 
        status_id, 
        type_id, 
        responsible_user_id, 
        floor, 
        building,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.school_id,
        body.status_id || 1, // Default to "Available"
        body.type_id,
        body.responsible_user_id || null,
        body.floor || '',
        body.building || '',
        body.notes || ''
      ]
    );
    
    // Get the newly inserted room with joined data
    const newRoom = await db.get(`
      SELECT
        r.*,
        s.name as school_name,
        rs.name as status_name,
        rt.name as type_name,
        u.name as responsible_user_name
      FROM
        rooms r
      LEFT JOIN schools s ON r.school_id = s.id
      LEFT JOIN room_statuses rs ON r.status_id = rs.id
      LEFT JOIN room_types rt ON r.type_id = rt.id
      LEFT JOIN users u ON r.responsible_user_id = u.id
      WHERE r.id = ?
    `, result.lastID);
    
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { message: 'Failed to create room', error: error.message },
      { status: 500 }
    );
  }
}
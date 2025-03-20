import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET all users
export async function GET(request) {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Base query
    let query = `
      SELECT u.*, s.name as school_name 
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
    `;
    
    const params = [];
    
    // Add filter for role if provided
    if (role) {
      query += ' WHERE u.role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY u.name ASC';
    
    const users = await db.all(query, params);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

// POST new user
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.no_induk || !body.phone) {
      return NextResponse.json(
        { message: 'Name, No Induk, and Phone are required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Check for existing no_induk
    const existingUserByNoInduk = await db.get('SELECT id FROM users WHERE no_induk = ?', body.no_induk);
    if (existingUserByNoInduk) {
      return NextResponse.json(
        { message: 'A user with this No Induk already exists' },
        { status: 400 }
      );
    }
    
    // Check for existing phone
    const existingUserByPhone = await db.get('SELECT id FROM users WHERE phone = ?', body.phone);
    if (existingUserByPhone) {
      return NextResponse.json(
        { message: 'A user with this phone number already exists' },
        { status: 400 }
      );
    }
    
    const result = await db.run(
      `INSERT INTO users (name, no_induk, school_id, phone, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.name,
        body.no_induk,
        body.school_id || null,
        body.phone,
        body.role || 'guru'
      ]
    );
    
    const newUser = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: error.message },
      { status: 500 }
    );
  }
}
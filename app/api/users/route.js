import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET all users
export async function GET() {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    const users = await db.all('SELECT * FROM users ORDER BY name ASC');
    
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
    if (!body.name) {
      return NextResponse.json(
        { message: 'User name is required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Check for existing email if provided
    if (body.email) {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', body.email);
      if (existingUser) {
        return NextResponse.json(
          { message: 'A user with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    const result = await db.run(
      `INSERT INTO users (name, email, phone, role)
       VALUES (?, ?, ?, ?)`,
      [
        body.name,
        body.email || null,
        body.phone || null,
        body.role || 'teacher'
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
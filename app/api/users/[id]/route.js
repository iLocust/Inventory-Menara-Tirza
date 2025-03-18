import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';

// Helper function to get a user by ID
async function getUserById(id) {
  const db = await openDb();
  return db.get('SELECT * FROM users WHERE id = ?', id);
}

// GET single user
export async function GET(request, { params }) {
  try {
    const id = params.id;
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) user
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Check if user exists
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'User name is required' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Check for email uniqueness if it's changed
    if (body.email && body.email !== user.email) {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [body.email, id]);
      if (existingUser) {
        return NextResponse.json(
          { message: 'A user with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    await db.run(
      `UPDATE users SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        role = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        body.name,
        body.email || null,
        body.phone || null,
        body.role || 'teacher',
        id
      ]
    );
    
    const updatedUser = await getUserById(id);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Check if user exists
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const db = await openDb();
    
    // Check if the user is responsible for any rooms
    const roomsCount = await db.get('SELECT COUNT(*) as count FROM rooms WHERE responsible_user_id = ?', id);
    
    if (roomsCount.count > 0) {
      return NextResponse.json(
        { message: 'Cannot delete user who is responsible for rooms. Please reassign the rooms first.' },
        { status: 400 }
      );
    }
    
    await db.run('DELETE FROM users WHERE id = ?', id);
    
    return NextResponse.json(
      { message: `User ${id} deleted successfully` }
    );
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
}
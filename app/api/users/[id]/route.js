import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';

// GET a specific user
export async function GET(request, { params }) {
  try {
    const userId = params.id;
    
    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    );
  }
}

// PUT/UPDATE a user
export async function PUT(request, { params }) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'User name is required' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE id = ?', userId);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check for existing email (if changed)
    if (body.email) {
      const emailCheck = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?', 
        [body.email, userId]
      );
      
      if (emailCheck) {
        return NextResponse.json(
          { message: 'Email is already in use by another user' },
          { status: 400 }
        );
      }
    }
    
    await db.run(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        body.name,
        body.email || null,
        body.phone || null,
        body.role || 'teacher',
        userId
      ]
    );
    
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', userId);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(request, { params }) {
  try {
    const userId = params.id;
    
    const db = await openDb();
    
    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE id = ?', userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is responsible for any rooms
    const roomCheck = await db.get(
      'SELECT id FROM rooms WHERE responsible_user_id = ?',
      userId
    );
    
    if (roomCheck) {
      return NextResponse.json(
        { message: 'Cannot delete user because they are responsible for one or more rooms' },
        { status: 400 }
      );
    }
    
    await db.run('DELETE FROM users WHERE id = ?', userId);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Failed to delete user', error: error.message },
      { status: 500 }
    );
  }
}

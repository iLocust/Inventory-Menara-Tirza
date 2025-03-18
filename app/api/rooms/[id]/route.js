import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';

// Helper function to get a room by ID with joined data
async function getRoomById(id) {
  const db = await openDb();
  return db.get(`
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
  `, id);
}

// GET single room
export async function GET(request, { params }) {
  try {
    const id = params.id;
    const room = await getRoomById(id);
    
    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(room);
  } catch (error) {
    console.error(`Error fetching room ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch room', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) room
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Check if room exists
    const room = await getRoomById(id);
    
    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
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
    if (body.school_id) {
      const schoolExists = await db.get('SELECT id FROM schools WHERE id = ?', body.school_id);
      if (!schoolExists) {
        return NextResponse.json(
          { message: 'Referenced school does not exist' },
          { status: 400 }
        );
      }
    }
    
    // Verify that the room type exists
    if (body.type_id) {
      const typeExists = await db.get('SELECT id FROM room_types WHERE id = ?', body.type_id);
      if (!typeExists) {
        return NextResponse.json(
          { message: 'Referenced room type does not exist' },
          { status: 400 }
        );
      }
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
    
    await db.run(
      `UPDATE rooms SET 
        name = ?, 
        school_id = ?, 
        status_id = ?, 
        type_id = ?, 
        responsible_user_id = ?, 
        floor = ?, 
        building = ?,
        notes = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        body.name,
        body.school_id,
        body.status_id || 1,
        body.type_id,
        body.responsible_user_id || null,
        body.floor || '',
        body.building || '',
        body.notes || '',
        id
      ]
    );
    
    const updatedRoom = await getRoomById(id);
    
    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error(`Error updating room ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update room', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE room
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Check if room exists
    const room = await getRoomById(id);
    
    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }
    
    const db = await openDb();
    
    // Check if there are items in this room
    const itemCount = await db.get('SELECT COUNT(*) as count FROM items WHERE room_id = ?', id);
    
    if (itemCount.count > 0) {
      return NextResponse.json(
        { message: 'Cannot delete room with items. Transfer or delete the items first.' },
        { status: 400 }
      );
    }
    
    await db.run('DELETE FROM rooms WHERE id = ?', id);
    
    return NextResponse.json(
      { message: `Room ${id} deleted successfully` }
    );
  } catch (error) {
    console.error(`Error deleting room ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete room', error: error.message },
      { status: 500 }
    );
  }
}
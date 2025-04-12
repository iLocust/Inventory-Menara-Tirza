import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET item history, filtered by room_id if provided
export async function GET(request) {
  try {
    await initializeDb();
    const db = await openDb();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const itemId = searchParams.get('item_id');
    const actionType = searchParams.get('action_type');
    
    let query = `
      SELECT
        h.*,
        u.name as user_name,
        sr.school_id as source_school_id,
        dr.school_id as destination_school_id,
        ss.name as source_school_name,
        ds.name as destination_school_name
      FROM
        item_history h
      LEFT JOIN users u ON h.user_id = u.id
      LEFT JOIN rooms sr ON h.source_room_id = sr.id
      LEFT JOIN rooms dr ON h.destination_room_id = dr.id
      LEFT JOIN schools ss ON sr.school_id = ss.id
      LEFT JOIN schools ds ON dr.school_id = ds.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Add filter conditions if provided
    if (roomId) {
      conditions.push('(h.room_id = ? OR h.source_room_id = ? OR h.destination_room_id = ?)');
      params.push(roomId, roomId, roomId);
    }
    
    if (itemId) {
      conditions.push('h.item_id = ?');
      params.push(itemId);
    }
    
    if (actionType) {
      conditions.push('h.action_type = ?');
      params.push(actionType);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY h.action_date DESC';
    
    const history = await db.all(query, params);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching item history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch item history', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new history entry
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.action_type || !body.item_name || !body.quantity) {
      return NextResponse.json(
        { message: 'Action type, item name, and quantity are required' },
        { status: 400 }
      );
    }
    
    if (body.quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Determine fields based on action type
    let fields = 'item_id, item_name, action_type, quantity, notes, user_id';
    let placeholders = '?, ?, ?, ?, ?, ?';
    let values = [
      body.item_id || null,
      body.item_name,
      body.action_type,
      body.quantity,
      body.notes || '',
      body.user_id || null
    ];
    
    // Add room_id for add/delete actions
    if (body.action_type === 'add' || body.action_type === 'delete') {
      fields += ', room_id';
      placeholders += ', ?';
      values.push(body.room_id || null);
    }
    
    // Add source and destination for transfer actions
    if (body.action_type === 'transfer') {
      fields += ', source_room_id, destination_room_id, source_room_name, destination_room_name';
      placeholders += ', ?, ?, ?, ?';
      values.push(
        body.source_room_id || null,
        body.destination_room_id || null,
        body.source_room_name || null,
        body.destination_room_name || null
      );
    }
    
    // Insert history record
    const result = await db.run(
      `INSERT INTO item_history (${fields}) VALUES (${placeholders})`,
      values
    );
    
    // Get the newly inserted history entry
    const newHistory = await db.get(
      `SELECT h.*, u.name as user_name 
       FROM item_history h
       LEFT JOIN users u ON h.user_id = u.id
       WHERE h.id = ?`,
      result.lastID
    );
    
    return NextResponse.json(newHistory, { status: 201 });
  } catch (error) {
    console.error('Error creating history entry:', error);
    return NextResponse.json(
      { message: 'Failed to create history entry', error: error.message },
      { status: 500 }
    );
  }
}

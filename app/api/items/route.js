import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET items with filtering options
export async function GET(request) {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');
    const schoolId = searchParams.get('school_id');
    const categoryId = searchParams.get('category_id');
    
    let query = `
      SELECT
        i.*,
        ic.name as category_name,
        r.name as room_name,
        s.name as school_name
      FROM
        items i
      JOIN item_categories ic ON i.category_id = ic.id
      JOIN rooms r ON i.room_id = r.id
      JOIN schools s ON r.school_id = s.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Add filter conditions if provided
    if (roomId) {
      conditions.push('i.room_id = ?');
      params.push(roomId);
    }
    
    if (schoolId) {
      conditions.push('r.school_id = ?');
      params.push(schoolId);
    }
    
    if (categoryId) {
      conditions.push('i.category_id = ?');
      params.push(categoryId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY s.name, r.name, i.name';
    
    const items = await db.all(query, params);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { message: 'Failed to fetch items', error: error.message },
      { status: 500 }
    );
  }
}

// POST new item
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.category_id || !body.room_id) {
      return NextResponse.json(
        { message: 'Name, category_id, and room_id are required' },
        { status: 400 }
      );
    }
    
    if (body.quantity < 0) {
      return NextResponse.json(
        { message: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Verify that the referenced category exists
    const categoryExists = await db.get('SELECT id FROM item_categories WHERE id = ?', body.category_id);
    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Referenced category does not exist' },
        { status: 400 }
      );
    }
    
    // Verify that the referenced room exists
    const roomExists = await db.get('SELECT id FROM rooms WHERE id = ?', body.room_id);
    if (!roomExists) {
      return NextResponse.json(
        { message: 'Referenced room does not exist' },
        { status: 400 }
      );
    }
    
    const result = await db.run(
      `INSERT INTO items (
        name, 
        category_id, 
        room_id, 
        quantity, 
        condition, 
        acquisition_date, 
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.category_id,
        body.room_id,
        body.quantity || 0,
        body.condition || 'Good',
        body.acquisition_date || null,
        body.notes || ''
      ]
    );
    
    // Get the newly inserted item with joined data
    const newItem = await db.get(`
      SELECT
        i.*,
        ic.name as category_name,
        r.name as room_name,
        s.name as school_name
      FROM
        items i
      JOIN item_categories ic ON i.category_id = ic.id
      JOIN rooms r ON i.room_id = r.id
      JOIN schools s ON r.school_id = s.id
      WHERE i.id = ?
    `, result.lastID);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { message: 'Failed to create item', error: error.message },
      { status: 500 }
    );
  }
}
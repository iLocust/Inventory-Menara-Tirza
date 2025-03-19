import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET all transfers or filtered by item_id, source_room_id, or destination_room_id
export async function GET(request) {
  try {
    await initializeDb();
    const db = await openDb();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const sourceRoomId = searchParams.get('source_room_id');
    const destinationRoomId = searchParams.get('destination_room_id');
    const roomId = searchParams.get('room_id'); // Either source or destination
    
    let query = `
      SELECT
        t.*,
        i.name as item_name,
        sr.name as source_room_name,
        dr.name as destination_room_name,
        sch.name as school_name
      FROM
        item_transfers t
      JOIN items i ON t.item_id = i.id
      JOIN rooms sr ON t.source_room_id = sr.id
      JOIN rooms dr ON t.destination_room_id = dr.id
      JOIN schools sch ON sr.school_id = sch.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Add filter conditions if provided
    if (itemId) {
      conditions.push('t.item_id = ?');
      params.push(itemId);
    }
    
    if (sourceRoomId) {
      conditions.push('t.source_room_id = ?');
      params.push(sourceRoomId);
    }
    
    if (destinationRoomId) {
      conditions.push('t.destination_room_id = ?');
      params.push(destinationRoomId);
    }
    
    if (roomId) {
      conditions.push('(t.source_room_id = ? OR t.destination_room_id = ?)');
      params.push(roomId, roomId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.transfer_date DESC';
    
    const transfers = await db.all(query, params);
    
    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch transfers', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new transfer
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.item_id || !body.source_room_id || !body.destination_room_id || !body.quantity) {
      return NextResponse.json(
        { message: 'Item ID, source room ID, destination room ID, and quantity are required' },
        { status: 400 }
      );
    }
    
    if (body.quantity <= 0) {
      return NextResponse.json(
        { message: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    if (body.source_room_id === body.destination_room_id) {
      return NextResponse.json(
        { message: 'Source and destination rooms must be different' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Get the current item to check if there's enough quantity
    const item = await db.get('SELECT * FROM items WHERE id = ?', body.item_id);
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Verify source room
    const sourceRoom = await db.get('SELECT * FROM rooms WHERE id = ?', body.source_room_id);
    if (!sourceRoom) {
      return NextResponse.json(
        { message: 'Source room not found' },
        { status: 404 }
      );
    }
    
    // Verify destination room
    const destRoom = await db.get('SELECT * FROM rooms WHERE id = ?', body.destination_room_id);
    if (!destRoom) {
      return NextResponse.json(
        { message: 'Destination room not found' },
        { status: 404 }
      );
    }
    
    // Verify both rooms are in same school
    if (sourceRoom.school_id !== destRoom.school_id) {
      return NextResponse.json(
        { message: 'Cannot transfer items between different schools' },
        { status: 400 }
      );
    }
    
    // Check if there's enough quantity
    if (item.quantity < body.quantity) {
      return NextResponse.json(
        { message: `Not enough items to transfer. Available: ${item.quantity}` },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Insert transfer record
      const result = await db.run(
        `INSERT INTO item_transfers (
          item_id,
          source_room_id,
          destination_room_id,
          quantity,
          notes
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          body.item_id,
          body.source_room_id,
          body.destination_room_id,
          body.quantity,
          body.notes || ''
        ]
      );
      
      // Reduce quantity from source
      await db.run(
        'UPDATE items SET quantity = quantity - ? WHERE id = ?',
        [body.quantity, body.item_id]
      );
      
      // Check if the item already exists in the destination room
      const existingItem = await db.get(
        'SELECT * FROM items WHERE name = ? AND category_id = ? AND room_id = ?',
        [item.name, item.category_id, body.destination_room_id]
      );
      
      if (existingItem) {
        // Update existing item in destination
        await db.run(
          'UPDATE items SET quantity = quantity + ? WHERE id = ?',
          [body.quantity, existingItem.id]
        );
      } else {
        // Create new item in destination
        await db.run(
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
            item.name,
            item.category_id,
            body.destination_room_id,
            body.quantity,
            item.condition,
            item.acquisition_date,
            item.notes
          ]
        );
      }
      
      // Commit the transaction
      await db.run('COMMIT');
      
      // Get the newly inserted transfer with joined data
      const newTransfer = await db.get(`
        SELECT
          t.*,
          i.name as item_name,
          sr.name as source_room_name,
          dr.name as destination_room_name
        FROM
          item_transfers t
        JOIN items i ON t.item_id = i.id
        JOIN rooms sr ON t.source_room_id = sr.id
        JOIN rooms dr ON t.destination_room_id = dr.id
        WHERE t.id = ?
      `, result.lastID);
      
      return NextResponse.json(newTransfer, { status: 201 });
    } catch (error) {
      // Rollback the transaction in case of error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { message: 'Failed to create transfer', error: error.message },
      { status: 500 }
    );
  }
}
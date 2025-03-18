import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../lib/db';

// GET transfer history with filtering options
export async function GET(request) {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const roomId = searchParams.get('room_id');
    const fromRoomId = searchParams.get('from_room_id');
    const toRoomId = searchParams.get('to_room_id');
    const userId = searchParams.get('user_id');
    
    let query = `
      SELECT
        t.*,
        i.name as item_name,
        fr.name as from_room_name,
        tr.name as to_room_name,
        u.name as transferred_by_name,
        fs.name as from_school_name,
        ts.name as to_school_name
      FROM
        item_transfers t
      JOIN items i ON t.item_id = i.id
      JOIN rooms fr ON t.from_room_id = fr.id
      JOIN rooms tr ON t.to_room_id = tr.id
      JOIN schools fs ON fr.school_id = fs.id
      JOIN schools ts ON tr.school_id = ts.id
      LEFT JOIN users u ON t.transferred_by_user_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    // Add filter conditions if provided
    if (itemId) {
      conditions.push('t.item_id = ?');
      params.push(itemId);
    }
    
    if (roomId) {
      conditions.push('(t.from_room_id = ? OR t.to_room_id = ?)');
      params.push(roomId, roomId);
    }
    
    if (fromRoomId) {
      conditions.push('t.from_room_id = ?');
      params.push(fromRoomId);
    }
    
    if (toRoomId) {
      conditions.push('t.to_room_id = ?');
      params.push(toRoomId);
    }
    
    if (userId) {
      conditions.push('t.transferred_by_user_id = ?');
      params.push(userId);
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

// POST new transfer (move items between rooms)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.item_id || !body.from_room_id || !body.to_room_id || body.quantity <= 0) {
      return NextResponse.json(
        { message: 'Item ID, from room ID, to room ID, and quantity (> 0) are required' },
        { status: 400 }
      );
    }
    
    // Prevent transferring to the same room
    if (body.from_room_id === body.to_room_id) {
      return NextResponse.json(
        { message: 'Cannot transfer items to the same room' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Check if the item exists in the source room with sufficient quantity
      const sourceItem = await db.get(
        'SELECT * FROM items WHERE id = ? AND room_id = ?', 
        [body.item_id, body.from_room_id]
      );
      
      if (!sourceItem) {
        await db.run('ROLLBACK');
        return NextResponse.json(
          { message: 'Item not found in the source room' },
          { status: 404 }
        );
      }
      
      if (sourceItem.quantity < body.quantity) {
        await db.run('ROLLBACK');
        return NextResponse.json(
          { message: `Not enough items in the source room. Available: ${sourceItem.quantity}` },
          { status: 400 }
        );
      }
      
      // Check if the destination room exists
      const destRoom = await db.get('SELECT * FROM rooms WHERE id = ?', body.to_room_id);
      if (!destRoom) {
        await db.run('ROLLBACK');
        return NextResponse.json(
          { message: 'Destination room not found' },
          { status: 404 }
        );
      }
      
      // Reduce quantity in source room
      await db.run(
        'UPDATE items SET quantity = quantity - ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND room_id = ?',
        [body.quantity, body.item_id, body.from_room_id]
      );
      
      // Delete the item if quantity becomes zero
      await db.run(
        'DELETE FROM items WHERE id = ? AND quantity <= 0',
        [body.item_id]
      );
      
      // Check if the item already exists in the destination room
      const destItem = await db.get(
        'SELECT * FROM items WHERE name = ? AND category_id = ? AND room_id = ?',
        [sourceItem.name, sourceItem.category_id, body.to_room_id]
      );
      
      if (destItem) {
        // Update quantity in destination room
        await db.run(
          'UPDATE items SET quantity = quantity + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [body.quantity, destItem.id]
        );
      } else {
        // Create a new item in the destination room
        await db.run(
          `INSERT INTO items (
            name, category_id, room_id, quantity, condition, acquisition_date, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            sourceItem.name,
            sourceItem.category_id,
            body.to_room_id,
            body.quantity,
            sourceItem.condition,
            sourceItem.acquisition_date,
            sourceItem.notes
          ]
        );
      }
      
      // Record the transfer in the history
      const result = await db.run(
        `INSERT INTO item_transfers (
          item_id, quantity, from_room_id, to_room_id, transferred_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          body.item_id,
          body.quantity,
          body.from_room_id,
          body.to_room_id,
          body.transferred_by_user_id || null,
          body.notes || ''
        ]
      );
      
      // Commit the transaction
      await db.run('COMMIT');
      
      // Get the full transfer record with joined data
      const newTransfer = await db.get(`
        SELECT
          t.*,
          i.name as item_name,
          fr.name as from_room_name,
          tr.name as to_room_name,
          u.name as transferred_by_name
        FROM
          item_transfers t
        JOIN items i ON t.item_id = i.id
        JOIN rooms fr ON t.from_room_id = fr.id
        JOIN rooms tr ON t.to_room_id = tr.id
        LEFT JOIN users u ON t.transferred_by_user_id = u.id
        WHERE t.id = ?
      `, result.lastID);
      
      return NextResponse.json(newTransfer, { status: 201 });
    } catch (error) {
      // Rollback in case of error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { message: 'Failed to transfer items', error: error.message },
      { status: 500 }
    );
  }
}
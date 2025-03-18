import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';

// Helper function to get an item by ID with joined data
async function getItemById(id) {
  const db = await openDb();
  return db.get(`
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
  `, id);
}

// GET single item
export async function GET(request, { params }) {
  try {
    const id = params.id;
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch item', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) item
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Check if item exists
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
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
    if (body.category_id) {
      const categoryExists = await db.get('SELECT id FROM item_categories WHERE id = ?', body.category_id);
      if (!categoryExists) {
        return NextResponse.json(
          { message: 'Referenced category does not exist' },
          { status: 400 }
        );
      }
    }
    
    // Verify that the referenced room exists
    if (body.room_id) {
      const roomExists = await db.get('SELECT id FROM rooms WHERE id = ?', body.room_id);
      if (!roomExists) {
        return NextResponse.json(
          { message: 'Referenced room does not exist' },
          { status: 400 }
        );
      }
    }
    
    await db.run(
      `UPDATE items SET 
        name = ?, 
        category_id = ?, 
        room_id = ?, 
        quantity = ?, 
        condition = ?, 
        acquisition_date = ?, 
        notes = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        body.name,
        body.category_id,
        body.room_id,
        body.quantity || 0,
        body.condition || 'Good',
        body.acquisition_date || null,
        body.notes || '',
        id
      ]
    );
    
    const updatedItem = await getItemById(id);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update item', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Check if item exists
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    const db = await openDb();
    
    // Check if there are transfers related to this item
    const transferCount = await db.get('SELECT COUNT(*) as count FROM item_transfers WHERE item_id = ?', id);
    
    if (transferCount.count > 0) {
      return NextResponse.json(
        { message: 'Cannot delete item with transfer history. Consider reducing quantity instead.' },
        { status: 400 }
      );
    }
    
    await db.run('DELETE FROM items WHERE id = ?', id);
    
    return NextResponse.json(
      { message: `Item ${id} deleted successfully` }
    );
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete item', error: error.message },
      { status: 500 }
    );
  }
}
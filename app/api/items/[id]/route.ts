import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET a single item by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const db = await getDb();
    const item = await db.get('SELECT * FROM items WHERE id = ?', id);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

// PUT (update) an item by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, category, quantity, location, condition, acquisition_date } = body;
    
    // Validate required fields
    if (!name || !category || quantity === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and quantity are required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Check if item exists
    const existingItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    await db.run(
      `UPDATE items SET 
        name = ?, 
        category = ?, 
        quantity = ?, 
        location = ?, 
        condition = ?, 
        acquisition_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, category, quantity, location || null, condition || null, acquisition_date || null, id]
    );
    
    const updatedItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Failed to update item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE an item by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const db = await getDb();
    
    // Check if item exists
    const existingItem = await db.get('SELECT * FROM items WHERE id = ?', id);
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    await db.run('DELETE FROM items WHERE id = ?', id);
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
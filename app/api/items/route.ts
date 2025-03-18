import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET all items
export async function GET() {
  try {
    const db = await getDb();
    const items = await db.all('SELECT * FROM items ORDER BY updated_at DESC');
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST (create) a new item
export async function POST(request: Request) {
  try {
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
    const result = await db.run(
      `INSERT INTO items (name, category, quantity, location, condition, acquisition_date) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, quantity, location || null, condition || null, acquisition_date || null]
    );
    
    const newItem = await db.get('SELECT * FROM items WHERE id = ?', result.lastID);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
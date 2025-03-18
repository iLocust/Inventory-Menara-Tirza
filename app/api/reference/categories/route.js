import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../../lib/db';

// GET all item categories
export async function GET() {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    const categories = await db.all('SELECT * FROM item_categories ORDER BY name ASC');
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching item categories:', error);
    return NextResponse.json(
      { message: 'Failed to fetch item categories', error: error.message },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Check if category already exists
    const existingCategory = await db.get('SELECT id FROM item_categories WHERE name = ?', body.name);
    if (existingCategory) {
      return NextResponse.json(
        { message: 'A category with this name already exists' },
        { status: 400 }
      );
    }
    
    const result = await db.run(
      `INSERT INTO item_categories (name, description)
       VALUES (?, ?)`,
      [
        body.name,
        body.description || null
      ]
    );
    
    const newCategory = await db.get('SELECT * FROM item_categories WHERE id = ?', result.lastID);
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}
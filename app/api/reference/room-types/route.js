import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../../lib/db';

// GET all room types
export async function GET() {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    const types = await db.all('SELECT * FROM room_types ORDER BY id ASC');
    
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching room types:', error);
    return NextResponse.json(
      { message: 'Failed to fetch room types', error: error.message },
      { status: 500 }
    );
  }
}
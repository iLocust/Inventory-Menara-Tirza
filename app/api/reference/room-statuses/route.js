import { NextResponse } from 'next/server';
import openDb, { initializeDb } from '../../../../lib/db';

// GET all room statuses
export async function GET() {
  try {
    // Initialize DB (creates tables if they don't exist)
    await initializeDb();
    
    const db = await openDb();
    const statuses = await db.all('SELECT * FROM room_statuses ORDER BY id ASC');
    
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching room statuses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch room statuses', error: error.message },
      { status: 500 }
    );
  }
}
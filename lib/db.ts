import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';

// Singleton pattern for database connection
let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: join(process.cwd(), 'school_inventory.db'),
      driver: sqlite3.Database,
    });
    
    // Initialize the database with the items table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        location TEXT,
        condition TEXT,
        acquisition_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  return db;
}

export async function closeDb() {
  if (db) {
    await db.close();
    db = null;
  }
}
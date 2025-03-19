import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// This function returns a database connection
async function openDb() {
  return open({
    filename: './db/inventory.db',
    driver: sqlite3.Database
  });
}

// Initialize the database with needed tables
export async function initializeDb() {
  const db = await openDb();
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');
  
  // Create schools table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create room status reference table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS room_statuses (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  
  // Insert room statuses if they don't exist
  const statusCount = await db.get('SELECT COUNT(*) as count FROM room_statuses');
  if (statusCount.count === 0) {
    await db.exec(`
      INSERT INTO room_statuses (id, name) VALUES
      (1, 'Available'),
      (2, 'Maintenance'),
      (3, 'Unavailable')
    `);
  }
  
  // Create room types reference table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS room_types (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  
  // Insert room types if they don't exist
  const typeCount = await db.get('SELECT COUNT(*) as count FROM room_types');
  if (typeCount.count === 0) {
    await db.exec(`
      INSERT INTO room_types (id, name) VALUES
      (1, 'Classroom'),
      (2, 'Lab'),
      (3, 'Library'),
      (4, 'Office'),
      (5, 'Hall'),
      (6, 'Storage'),
      (7, 'Toilet'),
      (8, 'Canteen'),
      (9, 'Sports'),
      (10, 'Misc')
    `);
  }
  
  // Create users table (for teachers/staff)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      role TEXT DEFAULT 'teacher',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create rooms table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      school_id INTEGER NOT NULL,
      status_id INTEGER NOT NULL DEFAULT 1,
      type_id INTEGER NOT NULL,
      responsible_user_id INTEGER,
      floor TEXT,
      building TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
      FOREIGN KEY (status_id) REFERENCES room_statuses(id),
      FOREIGN KEY (type_id) REFERENCES room_types(id),
      FOREIGN KEY (responsible_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  // Create item categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS item_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert default categories if they don't exist
  const categoryCount = await db.get('SELECT COUNT(*) as count FROM item_categories');
  if (categoryCount.count === 0) {
    await db.exec(`
      INSERT INTO item_categories (name) VALUES
      ('Furniture'),
      ('Electronics'),
      ('Books'),
      ('Lab Equipment'),
      ('Sports Equipment'),
      ('Stationery'),
      ('Teaching Aids'),
      ('Office Supplies'),
      ('Cleaning Supplies'),
      ('Other')
    `);
  }
  
  // Create items table (now linked to specific rooms)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      condition TEXT DEFAULT 'Good',
      acquisition_date TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES item_categories(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    )
  `);
  
  // Create transfers table to track item movements between rooms
  await db.exec(`
    CREATE TABLE IF NOT EXISTS item_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      source_room_id INTEGER NOT NULL,
      destination_room_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      notes TEXT,
      transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (source_room_id) REFERENCES rooms(id),
      FOREIGN KEY (destination_room_id) REFERENCES rooms(id)
    )
  `);
  
  return db;
}

// Export the openDb function for use in API routes
export default openDb;
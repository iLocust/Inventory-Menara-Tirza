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
      kepala_sekolah_id INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kepala_sekolah_id) REFERENCES users(id) ON DELETE SET NULL
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
      (1, 'Tersedia'),
      (2, 'Dalam Perbaikan'),
      (3, 'Tidak Tersedia')
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
      (1, 'Ruang Kelas'),
      (2, 'Laboratorium'),
      (3, 'Perpustakaan'),
      (4, 'Ruang Guru'),
      (5, 'Aula'),
      (6, 'Gudang'),
      (7, 'Toilet'),
      (8, 'Kantin'),
      (9, 'Lapangan Olahraga'),
      (10, 'Lainnya')
    `);
  }
  
  // Create users table with 5 roles
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      no_induk TEXT UNIQUE,
      school_id INTEGER,
      phone TEXT UNIQUE,
      role TEXT CHECK(role IN ('admin', 'kepala_sekolah', 'guru', 'staff', 'murid')) DEFAULT 'guru',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
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
      ('Furnitur'),
      ('Elektronik'),
      ('Buku'),
      ('Peralatan Laboratorium'),
      ('Peralatan Olahraga'),
      ('Alat Tulis'),
      ('Alat Peraga'),
      ('Perlengkapan Kantor'),
      ('Perlengkapan Kebersihan'),
      ('Lainnya')
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
      user_id INTEGER,
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (source_room_id) REFERENCES rooms(id),
      FOREIGN KEY (destination_room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  
  return db;
}

// Export the openDb function for use in API routes
export default openDb;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the database file
const dbPath = path.join(__dirname, '..', 'db', 'inventory.db');

console.log(`Checking for database at: ${dbPath}`);

// Check if file exists
if (fs.existsSync(dbPath)) {
  console.log('Database file found. Deleting...');
  fs.unlinkSync(dbPath);
  console.log('Database file deleted.');
} else {
  console.log('No existing database file found.');
}

console.log('Ready to recreate database from scratch.');

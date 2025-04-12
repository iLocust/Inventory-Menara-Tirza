import openDb from '../../lib/db.js';

async function updateActionTypeConstraint() {
  console.log('Starting migration: Updating action_type constraint in item_history table...');
  
  try {
    const db = await openDb();
    
    // Start a transaction
    await db.exec('BEGIN TRANSACTION');
    
    try {
      console.log('Creating temporary table with updated constraint...');
      
      // Create a temporary table with the updated constraint
      await db.exec(`
        CREATE TABLE item_history_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER,
          item_name TEXT NOT NULL,
          room_id INTEGER,
          action_type TEXT NOT NULL CHECK(action_type IN ('add', 'delete', 'transfer', 'update')),
          quantity INTEGER NOT NULL,
          notes TEXT,
          action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER,
          source_room_id INTEGER,
          destination_room_id INTEGER,
          source_room_name TEXT,
          destination_room_name TEXT,
          FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (source_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
          FOREIGN KEY (destination_room_id) REFERENCES rooms(id) ON DELETE SET NULL
        )
      `);
      
      // Copy data from the old table to the new one
      console.log('Copying data to the new table...');
      await db.exec(`
        INSERT INTO item_history_new
        SELECT * FROM item_history
      `);
      
      // Drop the old table
      console.log('Dropping old table...');
      await db.exec('DROP TABLE item_history');
      
      // Rename the new table to the original name
      console.log('Renaming new table...');
      await db.exec('ALTER TABLE item_history_new RENAME TO item_history');
      
      // Commit the transaction
      await db.exec('COMMIT');
      console.log('Migration completed successfully!');
    } catch (error) {
      // If an error occurs, roll back the transaction
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
updateActionTypeConstraint();

import openDb from '../../lib/db.js';

async function createItemHistoryTable() {
  console.log('Starting migration: Creating item_history table...');
  
  try {
    const db = await openDb();
    
    // Check if table exists
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='item_history'");
    
    if (!tableExists) {
      console.log('Creating item_history table...');
      
      await db.exec('BEGIN TRANSACTION');
      
      try {
        // Create item_history table
        await db.exec(`
          CREATE TABLE item_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            item_name TEXT NOT NULL,
            room_id INTEGER,
            action_type TEXT NOT NULL CHECK(action_type IN ('add', 'delete', 'transfer')),
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
        
        console.log('Successfully created item_history table');
        
        // Migration existing transfers to the history table
        console.log('Migrating existing transfers to history table...');
        
        await db.exec(`
          INSERT INTO item_history (
            item_id, 
            item_name,
            action_type, 
            quantity, 
            notes, 
            action_date, 
            user_id,
            source_room_id,
            destination_room_id,
            source_room_name,
            destination_room_name
          )
          SELECT 
            t.item_id,
            i.name,
            'transfer',
            t.quantity,
            t.notes,
            t.transfer_date,
            t.user_id,
            t.source_room_id,
            t.destination_room_id,
            sr.name,
            dr.name
          FROM item_transfers t
          LEFT JOIN items i ON t.item_id = i.id
          LEFT JOIN rooms sr ON t.source_room_id = sr.id
          LEFT JOIN rooms dr ON t.destination_room_id = dr.id
        `);
        
        console.log('Successfully migrated existing transfers');
        
        await db.exec('COMMIT');
      } catch (error) {
        console.error('Error during migration:', error);
        await db.exec('ROLLBACK');
        throw error;
      }
    } else {
      console.log('Table item_history already exists. Skipping creation...');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
createItemHistoryTable();

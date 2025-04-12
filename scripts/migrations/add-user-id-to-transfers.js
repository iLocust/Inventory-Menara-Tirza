import openDb from '../../lib/db.js';

async function addUserIdToTransfers() {
  console.log('Starting migration: Adding user_id column to item_transfers table...');
  
  try {
    const db = await openDb();
    
    // Check if column exists
    const tableInfo = await db.all("PRAGMA table_info(item_transfers)");
    const hasUserIdColumn = tableInfo.some(column => column.name === 'user_id');
    
    if (!hasUserIdColumn) {
      console.log('Adding user_id column to item_transfers table...');
      
      // Create a backup of the transfers table
      await db.exec('BEGIN TRANSACTION');
      
      try {
        // Add user_id column
        await db.exec('ALTER TABLE item_transfers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL');
        
        console.log('Successfully added user_id column to item_transfers table');
        await db.exec('COMMIT');
      } catch (error) {
        console.error('Error during migration:', error);
        await db.exec('ROLLBACK');
        throw error;
      }
    } else {
      console.log('Column user_id already exists in item_transfers table. Skipping...');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
addUserIdToTransfers();

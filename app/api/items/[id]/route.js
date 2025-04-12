import { NextResponse } from 'next/server';
import openDb from '../../../../lib/db';
import { canAccessItem } from '../../../../lib/school-access';

// Helper function to get an item by ID with joined data
async function getItemById(id) {
  const db = await openDb();
  return db.get(`
    SELECT
      i.*,
      ic.name as category_name,
      r.name as room_name,
      s.name as school_name
    FROM
      items i
    JOIN item_categories ic ON i.category_id = ic.id
    JOIN rooms r ON i.room_id = r.id
    JOIN schools s ON r.school_id = s.id
    WHERE i.id = ?
  `, id);
}

// GET single item
export async function GET(request, { params }) {
  try {
    const id = params.id;
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch item', error: error.message },
      { status: 500 }
    );
  }
}

// PUT (update) item
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    
    // Check if user has access to this item
    const hasAccess = await canAccessItem(id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to modify this item' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Get query parameters for user ID
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    console.log('Update item request with user_id:', userId);
    
    // Check if item exists
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Validate required fields
    if (!body.name || !body.category_id || !body.room_id) {
      return NextResponse.json(
        { message: 'Name, category_id, and room_id are required' },
        { status: 400 }
      );
    }
    
    if (body.quantity < 0) {
      return NextResponse.json(
        { message: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }
    
    const db = await openDb();
    
    // Verify that the referenced category exists
    if (body.category_id) {
      const categoryExists = await db.get('SELECT id FROM item_categories WHERE id = ?', body.category_id);
      if (!categoryExists) {
        return NextResponse.json(
          { message: 'Referenced category does not exist' },
          { status: 400 }
        );
      }
    }
    
    // Verify that the referenced room exists
    if (body.room_id) {
      const roomExists = await db.get('SELECT id FROM rooms WHERE id = ?', body.room_id);
      if (!roomExists) {
        return NextResponse.json(
          { message: 'Referenced room does not exist' },
          { status: 400 }
        );
      }
    }
    
    // Record history for update
    const recordUpdateHistory = async (oldItem, newData) => {
      // Track all changes
      let changes = [];
      let hasChanges = false;
      
      // Check if quantity has changed
      const oldQuantity = parseInt(oldItem.quantity);
      const newQuantity = parseInt(newData.quantity || 0);
      
      if (oldQuantity !== newQuantity) {
        changes.push(`Quantity changed from ${oldQuantity} to ${newQuantity}`);
        hasChanges = true;
        console.log(`Recording quantity change for item ${oldItem.id}: ${oldQuantity} -> ${newQuantity}`);
      }
      
      // Check if name has changed
      if (oldItem.name !== newData.name) {
        changes.push(`Name changed from "${oldItem.name}" to "${newData.name}"`);
        hasChanges = true;
        console.log(`Recording name change for item ${oldItem.id}: ${oldItem.name} -> ${newData.name}`);
      }
      
      // Check for condition change
      if (oldItem.condition !== newData.condition) {
        changes.push(`Condition changed from "${oldItem.condition}" to "${newData.condition}"`);
        hasChanges = true;
      }
      
      // If there are no significant changes, we might skip recording
      if (!hasChanges) {
        const oldProps = JSON.stringify({
          name: oldItem.name,
          category_id: oldItem.category_id,
          room_id: oldItem.room_id,
          quantity: oldItem.quantity,
          condition: oldItem.condition
        });
        
        const newProps = JSON.stringify({
          name: newData.name,
          category_id: newData.category_id,
          room_id: newData.room_id,
          quantity: newData.quantity,
          condition: newData.condition
        });
        
        if (oldProps !== newProps) {
          console.log('Other properties changed:', oldProps, '->', newProps);
          hasChanges = true;
          changes.push('Other properties updated');
        }
      }
      
      // Create notes from all changes
      let notes = changes.length > 0 ? changes.join('; ') : `Item updated: ${oldItem.name}`;
      
      // Only record if there are actual changes
      if (hasChanges) {
        console.log('Recording update to history for item:', oldItem.id, 'with user_id:', userId);
        console.log('Changes:', notes);
        
        await db.run(
          `INSERT INTO item_history (
            item_id,
            item_name,
            room_id,
            action_type,
            quantity,
            notes,
            user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            oldItem.id,
            oldItem.name,
            parseInt(newData.room_id) || parseInt(oldItem.room_id),
            'update',
            newQuantity, // Store the new quantity value instead of the difference
            notes,
            userId || null
          ]
        );
        return true; // Indicate that history was recorded
      }
      
      console.log('No significant changes detected, skipping history record');
      return false; // Indicate no history was recorded
    };
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Record history before updating
      const historyRecorded = await recordUpdateHistory(item, body);
      
      // Log the result
      console.log('History recorded:', historyRecorded);
      
      // Perform the update
      await db.run(
        `UPDATE items SET 
          name = ?, 
          category_id = ?, 
          room_id = ?, 
          quantity = ?, 
          condition = ?, 
          acquisition_date = ?, 
          notes = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          body.name,
          body.category_id,
          body.room_id,
          body.quantity || 0,
          body.condition || 'Good',
          body.acquisition_date || null,
          body.notes || '',
          id
        ]
      );
      
      // Commit the transaction
      await db.run('COMMIT');
      
      const updatedItem = await getItemById(id);
      
      return NextResponse.json(updatedItem);
    } catch (error) {
      // Rollback in case of error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to update item', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // Get query parameters for user ID
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    // Check if user has access to delete this item
    const hasAccess = await canAccessItem(id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this item' },
        { status: 403 }
      );
    }
    
    // Check if item exists
    const item = await getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }
    
    const db = await openDb();
    
    // Check if there are transfers related to this item
    const transferCount = await db.get('SELECT COUNT(*) as count FROM item_transfers WHERE item_id = ?', id);
    
    if (transferCount.count > 0) {
      return NextResponse.json(
        { message: 'Cannot delete item with transfer history. Consider reducing quantity instead.' },
        { status: 400 }
      );
    }
    
    
    // Start a transaction to ensure both history and delete operations complete together
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Record to history before deleting
      console.log('Recording delete to history for item:', id, 'with user_id:', userId);
      await db.run(
        `INSERT INTO item_history (
          item_id,
          item_name,
          room_id,
          action_type,
          quantity,
          notes,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.name,
          item.room_id,
          'delete',
          item.quantity,
          `Item deleted: ${item.name}`,
          userId || null
        ]
      );
      
      // Delete the item
      await db.run('DELETE FROM items WHERE id = ?', id);
      
      // Commit the transaction
      await db.run('COMMIT');
      
      return NextResponse.json(
        { message: `Item ${id} deleted successfully` }
      );
    } catch (error) {
      // Rollback in case of error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete item', error: error.message },
      { status: 500 }
    );
  }
}
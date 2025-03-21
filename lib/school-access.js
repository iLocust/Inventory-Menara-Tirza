import openDb from './db.js';
import { getCurrentUser } from './auth.js';

// Check if user has access to a specific school
export async function canAccessSchool(schoolId) {
  const user = await getCurrentUser();
  
  // If no user is logged in, deny access
  if (!user) {
    return false;
  }
  
  // Admin can access any school
  if (user.role === 'admin') {
    return true;
  }
  
  // Kepala Sekolah can only access their assigned school
  if (user.role === 'kepala_sekolah') {
    return user.school_id === parseInt(schoolId);
  }
  
  // Default: other roles can access any school for now
  return true;
}

// Check if user has access to a specific room
export async function canAccessRoom(roomId) {
  const user = await getCurrentUser();
  
  // If no user is logged in, deny access
  if (!user) {
    return false;
  }
  
  // Admin can access any room
  if (user.role === 'admin') {
    return true;
  }
  
  // For Kepala Sekolah, check if the room belongs to their school
  if (user.role === 'kepala_sekolah') {
    const db = await openDb();
    const room = await db.get('SELECT school_id FROM rooms WHERE id = ?', roomId);
    
    if (!room) {
      return false;
    }
    
    return user.school_id === room.school_id;
  }
  
  // Default: other roles can access any room for now
  return true;
}

// Check if user has access to items in a specific room
export async function canAccessItem(itemId) {
  const user = await getCurrentUser();
  
  // If no user is logged in, deny access
  if (!user) {
    return false;
  }
  
  // Admin can access any item
  if (user.role === 'admin') {
    return true;
  }
  
  // For Kepala Sekolah, check if the item belongs to a room in their school
  if (user.role === 'kepala_sekolah') {
    const db = await openDb();
    const item = await db.get(`
      SELECT r.school_id 
      FROM items i
      JOIN rooms r ON i.room_id = r.id
      WHERE i.id = ?
    `, itemId);
    
    if (!item) {
      return false;
    }
    
    return user.school_id === item.school_id;
  }
  
  // Default: other roles can access any item for now
  return true;
}

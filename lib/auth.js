import { cookies as nextCookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import openDb from './db.js';
import crypto from 'crypto';

// Helper to hash passwords
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// Helper to verify passwords
export function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// Add a password to a user
export async function addUserPassword(userId, password) {
  const db = await openDb();
  const { hash, salt } = hashPassword(password);
  
  // Check if user exists
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Add password fields to users table if they don't exist
  const tableInfo = await db.all("PRAGMA table_info(users)");
  const hasPasswordField = tableInfo.some(column => column.name === 'password_hash');
  const hasSaltField = tableInfo.some(column => column.name === 'password_salt');
  
  if (!hasPasswordField) {
    await db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  }
  
  if (!hasSaltField) {
    await db.exec('ALTER TABLE users ADD COLUMN password_salt TEXT');
  }
  
  // Update user with password
  await db.run(
    'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?',
    [hash, salt, userId]
  );
  
  return { success: true };
}

// Authenticate a user
export async function authenticateUser(phone, password) {
  const db = await openDb();
  
  // Get user by phone number
  const user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // For the new system, password should match the user's no_induk
  if (password !== user.no_induk) {
    return { success: false, error: 'Invalid password' };
  }
  
  // For backward compatibility, check hashed password if present
  if (user.password_hash && user.password_salt) {
    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }
  }
  
  // Return user without sensitive data
  const { password_hash, password_salt, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

// Create a secure session
export async function createSession(user) {
  // Generate a random session ID
  const sessionId = crypto.randomBytes(32).toString('hex');
  const db = await openDb();
  
  try {
    // Drop the sessions table if it exists, so we can recreate it with the correct schema
    // This is a temporary solution - in production, you'd want to migrate data instead
    await db.exec('DROP TABLE IF EXISTS sessions');
    
    // Create the sessions table with the correct schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Store session in database
    await db.run(
      'INSERT INTO sessions (id, user_id) VALUES (?, ?)',
      [sessionId, user.id]
    );
    
    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Get current user from cookies - this is only used in Next.js server components & API routes
export async function getCurrentUser() {
  try {
    const cookieStore = nextCookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      return null;
    }
    
    const db = await openDb();
    
    // Get session by ID only
    const session = await db.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    
    if (!session) {
      return null;
    }
    
    // Get user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);
    
    if (!user) {
      return null;
    }
    
    // Remove sensitive data
    const { password_hash, password_salt, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// End session
export async function endSession() {
  try {
    const cookieStore = nextCookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (sessionId) {
      const db = await openDb();
      await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
}

// Require authentication for routes
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

// Require specific role for routes
export async function requireRole(requiredRole) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.role !== requiredRole && user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return user;
}

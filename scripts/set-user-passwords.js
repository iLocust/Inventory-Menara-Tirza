import { initializeDb } from '../lib/db.js';
import crypto from 'crypto';

// Helper to hash passwords - duplicated here to avoid Next.js imports
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// This is a utility script to set default passwords for all users in the database
// Run this with: node scripts/set-user-passwords.js
async function setUserPasswords() {
  console.log('Setting default passwords for all users...');
  
  try {
    const db = await initializeDb();
    
    // Add password fields to users table if they don't exist
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const hasPasswordHash = tableInfo.some(column => column.name === 'password_hash');
    const hasPasswordSalt = tableInfo.some(column => column.name === 'password_salt');
    
    if (!hasPasswordHash) {
      console.log('Adding password_hash column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
    }
    
    if (!hasPasswordSalt) {
      console.log('Adding password_salt column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN password_salt TEXT');
    }
    
    // Get all users
    const users = await db.all('SELECT id, email, role FROM users');
    console.log(`Found ${users.length} users in the database`);
    
    // Set a default password for all users based on their role
    // In a real app, you would send password reset emails instead
    for (const user of users) {
      // Use a default password based on role - in production you'd use random passwords or reset links
      const defaultPassword = `password123_${user.role}`;
      const { hash, salt } = hashPassword(defaultPassword);
      
      await db.run(
        'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?',
        [hash, salt, user.id]
      );
      
      console.log(`Set password for user ID ${user.id} (${user.email})`);
    }
    
    console.log('\nDefault passwords set for all users:');
    console.log('- Admin users: password123_admin');
    console.log('- Kepala Sekolah users: password123_kepala_sekolah');
    console.log('- Guru users: password123_guru');
    console.log('- Staff users: password123_staff');
    console.log('- Murid users: password123_murid');
    
    console.log('\nDone setting passwords');
  } catch (error) {
    console.error('Error setting user passwords:', error);
  }
}

// Run the function
setUserPasswords();

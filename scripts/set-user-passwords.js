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
    const users = await db.all('SELECT id, name, no_induk, phone, role FROM users');
    console.log(`Found ${users.length} users in the database`);
    
    // Set a default password for all users based on their no_induk
    // In our system, the password is the same as the no_induk
    for (const user of users) {
      // Use no_induk as password
      const userPassword = user.no_induk || `default_${user.id}`;
      const { hash, salt } = hashPassword(userPassword);
      
      await db.run(
        'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?',
        [hash, salt, user.id]
      );
      
      console.log(`Set password for user ID ${user.id} (${user.name}): ${userPassword}`);
    }
    
    console.log('\nPasswords set for all users:');
    console.log('Each user password is set to their respective no_induk (NIK/NIP/NIS).');
    console.log('For example, user TUTUT RATNASARI WAHYU W. has password: 0405028');
    
    console.log('\nDone setting passwords');
  } catch (error) {
    console.error('Error setting user passwords:', error);
  }
}

// Run the function
setUserPasswords();

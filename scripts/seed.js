import { initializeDb } from '../lib/db.js';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    const db = await initializeDb();
    
    // Clear existing data first
    console.log('Clearing existing data...');
    // Delete in proper order to respect foreign key constraints
    await db.run('DELETE FROM items');
    await db.run('DELETE FROM rooms'); 
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM schools');
    
    // Add 6 schools
    console.log('Adding schools...');
    const schools = [
      { name: 'South High School', address: '456 South Ave', phone: '555-1002', email: 'info@south.edu' },
    ];
    
    for (const school of schools) {
      await db.run(
        'INSERT INTO schools (name, address, phone, email) VALUES (?, ?, ?, ?)',
        [school.name, school.address, school.phone, school.email]
      );
    }
    
    // Add some teachers/staff
    console.log('Adding users...');
    const users = [
      { name: 'John Smith', email: 'jsmith@school.edu', phone: '555-2001', role: 'teacher' },
      { name: 'Maria Garcia', email: 'mgarcia@school.edu', phone: '555-2002', role: 'teacher' },
      { name: 'David Brown', email: 'dbrown@school.edu', phone: '555-2003', role: 'admin' },
      { name: 'Sarah Johnson', email: 'sjohnson@school.edu', phone: '555-2004', role: 'teacher' },
      { name: 'Michael Lee', email: 'mlee@school.edu', phone: '555-2005', role: 'teacher' },
      { name: 'Jennifer Wilson', email: 'jwilson@school.edu', phone: '555-2006', role: 'staff' }
    ];
    
    for (const user of users) {
      await db.run(
        'INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.phone, user.role]
      );
    }
    
    // Add some rooms for each school
    console.log('Adding rooms...');
    
    // Get school IDs
    const schoolRows = await db.all('SELECT id FROM schools');
    const schoolIds = schoolRows.map(row => row.id);
    
    // Get user IDs for room assignment
    const userRows = await db.all('SELECT id FROM users');
    const userIds = userRows.map(row => row.id);
    
    for (const schoolId of schoolIds) {
      // Add classrooms
      for (let i = 1; i <= 3; i++) {
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Room ${i}A`, schoolId, 1, 1, userIds[Math.floor(Math.random() * userIds.length)], '1', 'Main']
        );
        
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Room ${i}B`, schoolId, 1, 1, userIds[Math.floor(Math.random() * userIds.length)], '1', 'Main']
        );
      }
      
      // Add one lab
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Science Lab', schoolId, 1, 2, userIds[Math.floor(Math.random() * userIds.length)], '2', 'Main']
      );
      
      // Add one library
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Library', schoolId, 1, 3, userIds[Math.floor(Math.random() * userIds.length)], '1', 'East']
      );
      
      // Add one office
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Administration Office', schoolId, 1, 4, userIds[Math.floor(Math.random() * userIds.length)], '1', 'Main']
      );
      
      // Add storage
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Storage Room', schoolId, 1, 6, userIds[Math.floor(Math.random() * userIds.length)], 'B', 'Main']
      );
    }
    
    // Get room IDs for item assignment
    const roomRows = await db.all('SELECT id, type_id FROM rooms');
    
    // Add items to rooms
    console.log('Adding inventory items...');
    
    for (const room of roomRows) {
      // Add appropriate items based on room type
      if (room.type_id === 1) { // Classroom
        // Desks
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Student Desk', 1, room.id, 25, 'Good', null, 'Standard student desks']
        );
        
        // Chairs
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Student Chair', 1, room.id, 25, 'Good', null, 'Standard student chairs']
        );
        
        // Teacher desk
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Teacher Desk', 1, room.id, 1, 'Good', null, 'Standard teacher desk']
        );
        
        // Whiteboard
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Whiteboard', 7, room.id, 2, 'Good', null, 'Large whiteboards']
        );
        
        // Projector
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Projector', 2, room.id, 1, 'Good', null, 'Ceiling-mounted projector']
        );
      } else if (room.type_id === 2) { // Lab
        // Lab tables
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Lab Table', 1, room.id, 10, 'Good', null, 'Chemical resistant lab tables']
        );
        
        // Lab stools
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Lab Stool', 1, room.id, 20, 'Good', null, 'Adjustable height lab stools']
        );
        
        // Microscopes
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Microscope', 4, room.id, 15, 'Good', null, 'Student microscopes']
        );
        
        // Safety equipment
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Safety Goggles', 4, room.id, 30, 'Good', null, 'Safety goggles for students']
        );
      } else if (room.type_id === 3) { // Library
        // Bookshelves
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Bookshelf', 1, room.id, 20, 'Good', null, 'Standard bookshelves']
        );
        
        // Study tables
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Study Table', 1, room.id, 8, 'Good', null, '4-person study tables']
        );
        
        // Chairs
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Library Chair', 1, room.id, 32, 'Good', null, 'Padded library chairs']
        );
        
        // Computers
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Computer Workstation', 2, room.id, 6, 'Good', null, 'Library catalog access computers']
        );
      } else if (room.type_id === 6) { // Storage
        // Various stored items
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Extra Student Desk', 1, room.id, 15, 'Fair', null, 'Backup student desks']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Extra Student Chair', 1, room.id, 20, 'Fair', null, 'Backup student chairs']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Whiteboard Marker', 6, room.id, 100, 'New', null, 'Whiteboard markers in various colors']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Projector Bulb', 2, room.id, 5, 'New', null, 'Replacement projector bulbs']
        );
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seed();
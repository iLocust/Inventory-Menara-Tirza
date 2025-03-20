import { initializeDb } from '../lib/db.js';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    const db = await initializeDb();
    
    // Clear existing data first
    console.log('Clearing existing data...');
    // Delete in proper order to respect foreign key constraints
    await db.run('DELETE FROM item_transfers');
    await db.run('DELETE FROM items');
    await db.run('DELETE FROM rooms'); 
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM schools');
    
    // Add schools with Indonesian names
    console.log('Adding schools...');
    const schools = [
      { 
        name: 'SMA Negeri 1 Jakarta', 
        address: 'Jl. Matraman Raya No. 45, Jakarta Pusat', 
        phone: '021-5550101', 
        email: 'info@sman1jakarta.sch.id' 
      },
      { 
        name: 'SMP Negeri 2 Bandung', 
        address: 'Jl. Surapati No. 12, Bandung', 
        phone: '022-7301234', 
        email: 'info@smpn2bandung.sch.id' 
      },
      { 
        name: 'SD Negeri 3 Surabaya', 
        address: 'Jl. Pemuda No. 33, Surabaya', 
        phone: '031-8432157', 
        email: 'info@sdn3sby.sch.id' 
      }
    ];
    
    for (const school of schools) {
      await db.run(
        'INSERT INTO schools (name, address, phone, email) VALUES (?, ?, ?, ?)',
        [school.name, school.address, school.phone, school.email]
      );
    }
    
    // Add users with the 5 specified roles
    console.log('Adding users...');
    const users = [
      // Admin/Head Office
      { 
        name: 'Achieles Zakarias', 
        no_induk: '0001', 
        school_id: null, 
        phone: '081212345678', 
        role: 'admin' 
      },
      { 
        name: 'Dimas Alexandra', 
        no_induk: '0002', 
        school_id: null, 
        phone: '081356464187', 
        role: 'admin' 
      },
      
      // Kepala Sekolah - One for each school
      { 
        name: 'Tutut Ratnasari Wahyu W', 
        no_induk: '1001', 
        school_id: 1, 
        phone: '081578901234', 
        role: 'kepala_sekolah' 
      },
      { 
        name: 'Dra. Rina Kartika', 
        no_induk: '1002', 
        school_id: 2, 
        phone: '081987654321', 
        role: 'kepala_sekolah' 
      },
      { 
        name: 'M.Pd. Joko Widodo', 
        no_induk: '1003', 
        school_id: 3, 
        phone: '081856789012', 
        role: 'kepala_sekolah' 
      },
      
      // Guru
      { 
        name: 'TUTUT RATNASARI WAHYU W.', 
        no_induk: '0405028', 
        school_id: 1, 
        phone: '085691638082', 
        role: 'guru' 
      },
      { 
        name: 'Hadi Supriyanto', 
        no_induk: '2002', 
        school_id: 2, 
        phone: '085633445566', 
        role: 'guru' 
      },
      { 
        name: 'Rina Wati', 
        no_induk: '2003', 
        school_id: 3, 
        phone: '082155667788', 
        role: 'guru' 
      },
      
      // Staff
      { 
        name: 'Agus Darmawan', 
        no_induk: '3001', 
        school_id: 1, 
        phone: '081199887766', 
        role: 'staff' 
      },
      { 
        name: 'Tuti Setiawati', 
        no_induk: '3002', 
        school_id: 2, 
        phone: '082212349876', 
        role: 'staff' 
      },
      { 
        name: 'Bambang Tri', 
        no_induk: '3003', 
        school_id: 3, 
        phone: '083366554433', 
        role: 'staff' 
      },
      
      // Murid
      { 
        name: 'Rizky Pratama', 
        no_induk: '4001', 
        school_id: 1, 
        phone: '087888776655', 
        role: 'murid' 
      },
      { 
        name: 'Dian Safitri', 
        no_induk: '4002', 
        school_id: 2, 
        phone: '087766554433', 
        role: 'murid' 
      },
      { 
        name: 'Wahyu Nugroho', 
        no_induk: '4003', 
        school_id: 3, 
        phone: '085544332211', 
        role: 'murid' 
      }
    ];
    
    for (const user of users) {
      await db.run(
        'INSERT INTO users (name, no_induk, school_id, phone, role) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.no_induk, user.school_id, user.phone, user.role]
      );
    }
    
    // Add rooms for each school
    console.log('Adding rooms...');
    
    // Get school IDs
    const schoolRows = await db.all('SELECT id, name FROM schools');
    
    // Get user IDs by role for room assignment
    const adminUsers = await db.all("SELECT id FROM users WHERE role = 'admin'");
    const kepalaSekolahUsers = await db.all("SELECT id, school_id FROM users WHERE role = 'kepala_sekolah'");
    const guruUsers = await db.all("SELECT id, school_id FROM users WHERE role = 'guru'");
    const staffUsers = await db.all("SELECT id, school_id FROM users WHERE role = 'staff'");
    
    // Function to get appropriate kepala sekolah for a school
    const getKepalaSekolahForSchool = (schoolId) => {
      const kepala = kepalaSekolahUsers.find(u => u.school_id === schoolId);
      return kepala ? kepala.id : kepalaSekolahUsers[0].id;
    };
    
    // Function to get appropriate guru for a school
    const getGuruForSchool = (schoolId) => {
      const guru = guruUsers.find(u => u.school_id === schoolId);
      return guru ? guru.id : guruUsers[0].id;
    };
    
    // Function to get appropriate staff for a school
    const getStaffForSchool = (schoolId) => {
      const staff = staffUsers.find(u => u.school_id === schoolId);
      return staff ? staff.id : staffUsers[0].id;
    };
    
    for (const school of schoolRows) {
      const schoolCode = school.name.toLowerCase().replace(/\s+/g, '');
      
      // Add ruang kelas
      for (let i = 1; i <= 3; i++) {
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Kelas ${i}A`, school.id, 1, 1, getGuruForSchool(school.id), '1', 'Gedung Utama']
        );
        
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Kelas ${i}B`, school.id, 1, 1, getGuruForSchool(school.id), '1', 'Gedung Utama']
        );
      }
      
      // Add laboratorium
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Laboratorium IPA', school.id, 1, 2, getGuruForSchool(school.id), '2', 'Gedung Utama']
      );
      
      // Add perpustakaan
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Perpustakaan', school.id, 1, 3, getStaffForSchool(school.id), '1', 'Gedung Timur']
      );
      
      // Add ruang guru
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Ruang Guru', school.id, 1, 4, getKepalaSekolahForSchool(school.id), '1', 'Gedung Utama']
      );
      
      // Add ruang kepala sekolah
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Ruang Kepala Sekolah', school.id, 1, 4, getKepalaSekolahForSchool(school.id), '1', 'Gedung Utama']
      );
      
      // Add gudang
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Gudang', school.id, 1, 6, getStaffForSchool(school.id), 'B', 'Gedung Utama']
      );
    }
    
    // Get room IDs for item assignment
    const roomRows = await db.all('SELECT id, name, type_id FROM rooms');
    
    // Add items to rooms
    console.log('Adding inventory items...');
    
    for (const room of roomRows) {
      // Add appropriate items based on room type
      if (room.type_id === 1) { // Ruang Kelas
        // Meja siswa
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Siswa', 1, room.id, 25, 'Baik', '2022-05-15', 'Meja standar untuk siswa']
        );
        
        // Kursi siswa
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kursi Siswa', 1, room.id, 25, 'Baik', '2022-05-15', 'Kursi standar untuk siswa']
        );
        
        // Meja guru
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Guru', 1, room.id, 1, 'Baik', '2022-04-10', 'Meja untuk guru']
        );
        
        // Papan tulis
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Papan Tulis', 7, room.id, 2, 'Baik', '2022-04-10', 'Papan tulis ukuran besar']
        );
        
        // Proyektor
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Proyektor', 2, room.id, 1, 'Baik', '2022-03-22', 'Proyektor yang terpasang di langit-langit']
        );
      } else if (room.type_id === 2) { // Laboratorium
        // Meja lab
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Laboratorium', 1, room.id, 10, 'Baik', '2022-02-15', 'Meja tahan bahan kimia']
        );
        
        // Kursi lab
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kursi Laboratorium', 1, room.id, 20, 'Baik', '2022-02-15', 'Kursi dengan tinggi yang dapat disesuaikan']
        );
        
        // Mikroskop
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Mikroskop', 4, room.id, 15, 'Baik', '2022-01-10', 'Mikroskop untuk siswa']
        );
        
        // Peralatan keamanan
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kacamata Pelindung', 4, room.id, 30, 'Baik', '2022-01-10', 'Kacamata pelindung untuk siswa']
        );
      } else if (room.type_id === 3) { // Perpustakaan
        // Rak buku
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Rak Buku', 1, room.id, 20, 'Baik', '2021-12-05', 'Rak buku standar']
        );
        
        // Meja baca
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Baca', 1, room.id, 8, 'Baik', '2021-12-05', 'Meja baca untuk 4 orang']
        );
        
        // Kursi perpustakaan
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kursi Perpustakaan', 1, room.id, 32, 'Baik', '2021-12-05', 'Kursi dengan bantalan untuk perpustakaan']
        );
        
        // Komputer
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Komputer Katalog', 2, room.id, 6, 'Baik', '2022-01-15', 'Komputer untuk akses katalog perpustakaan']
        );
        
        // Buku
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Buku Pelajaran', 3, room.id, 500, 'Baik', '2022-01-20', 'Buku pelajaran berbagai mata pelajaran']
        );
        
        // Buku fiksi
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Buku Fiksi', 3, room.id, 300, 'Baik', '2022-01-20', 'Novel dan cerita fiksi']
        );
      } else if (room.type_id === 4) { // Ruang Guru/Kepala Sekolah
        // Meja kerja
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Kerja', 1, room.id, room.name.includes('Kepala') ? 1 : 10, 'Baik', '2021-11-10', 'Meja kerja dengan laci']
        );
        
        // Kursi kerja
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kursi Kerja', 1, room.id, room.name.includes('Kepala') ? 1 : 10, 'Baik', '2021-11-10', 'Kursi kerja ergonomis']
        );
        
        // Lemari arsip
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Lemari Arsip', 1, room.id, room.name.includes('Kepala') ? 2 : 5, 'Baik', '2021-11-15', 'Lemari untuk menyimpan dokumen']
        );
        
        // Komputer
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Komputer', 2, room.id, room.name.includes('Kepala') ? 1 : 5, 'Baik', '2022-01-15', 'Komputer untuk pekerjaan administratif']
        );
        
        if (room.name.includes('Kepala')) {
          // Sofa tamu
          await db.run(
            'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Sofa Tamu', 1, room.id, 1, 'Baik', '2021-11-20', 'Set sofa untuk menerima tamu']
          );
          
          // Meja tamu
          await db.run(
            'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Meja Tamu', 1, room.id, 1, 'Baik', '2021-11-20', 'Meja untuk ruang tamu']
          );
        }
      } else if (room.type_id === 6) { // Gudang
        // Barang-barang yang disimpan
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Meja Siswa Cadangan', 1, room.id, 15, 'Cukup Baik', '2020-05-15', 'Meja cadangan untuk siswa']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kursi Siswa Cadangan', 1, room.id, 20, 'Cukup Baik', '2020-05-15', 'Kursi cadangan untuk siswa']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Spidol Papan Tulis', 6, room.id, 100, 'Baru', '2023-01-10', 'Spidol untuk papan tulis berbagai warna']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Lampu Proyektor', 2, room.id, 5, 'Baru', '2023-01-10', 'Lampu pengganti untuk proyektor']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Kertas HVS', 8, room.id, 50, 'Baru', '2023-01-15', 'Rim kertas HVS A4']
        );
        
        await db.run(
          'INSERT INTO items (name, category_id, room_id, quantity, condition, acquisition_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ['Alat Peraga Matematika', 7, room.id, 10, 'Baik', '2022-06-10', 'Set alat peraga untuk mata pelajaran matematika']
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
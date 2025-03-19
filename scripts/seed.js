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
        name: 'Budi Santoso', 
        email: 'budi.santoso@depdiknas.go.id', 
        phone: '0812-1234-5678', 
        role: 'admin' 
      },
      { 
        name: 'Siti Aminah', 
        email: 'siti.aminah@depdiknas.go.id', 
        phone: '0813-2345-6789', 
        role: 'admin' 
      },
      
      // Kepala Sekolah
      { 
        name: 'Dr. Ahmad Wijaya', 
        email: 'ahmad.wijaya@sman1jakarta.sch.id', 
        phone: '0815-7890-1234', 
        role: 'kepala_sekolah' 
      },
      { 
        name: 'Dra. Rina Kartika', 
        email: 'rina.kartika@smpn2bandung.sch.id', 
        phone: '0819-8765-4321', 
        role: 'kepala_sekolah' 
      },
      { 
        name: 'M.Pd. Joko Widodo', 
        email: 'joko.widodo@sdn3sby.sch.id', 
        phone: '0818-5678-9012', 
        role: 'kepala_sekolah' 
      },
      
      // Guru
      { 
        name: 'Dewi Anggraini', 
        email: 'dewi.anggraini@sman1jakarta.sch.id', 
        phone: '0857-1122-3344', 
        role: 'guru' 
      },
      { 
        name: 'Hadi Supriyanto', 
        email: 'hadi.supriyanto@smpn2bandung.sch.id', 
        phone: '0856-3344-5566', 
        role: 'guru' 
      },
      { 
        name: 'Rina Wati', 
        email: 'rina.wati@sdn3sby.sch.id', 
        phone: '0821-5566-7788', 
        role: 'guru' 
      },
      
      // Staff
      { 
        name: 'Agus Darmawan', 
        email: 'agus.darmawan@sman1jakarta.sch.id', 
        phone: '0811-9988-7766', 
        role: 'staff' 
      },
      { 
        name: 'Tuti Setiawati', 
        email: 'tuti.setiawati@smpn2bandung.sch.id', 
        phone: '0822-1234-9876', 
        role: 'staff' 
      },
      { 
        name: 'Bambang Tri', 
        email: 'bambang.tri@sdn3sby.sch.id', 
        phone: '0833-6655-4433', 
        role: 'staff' 
      },
      
      // Murid
      { 
        name: 'Rizky Pratama', 
        email: 'rizky.pratama@siswa.sman1jakarta.sch.id', 
        phone: '0878-8877-6655', 
        role: 'murid' 
      },
      { 
        name: 'Dian Safitri', 
        email: 'dian.safitri@siswa.smpn2bandung.sch.id', 
        phone: '0877-6655-4433', 
        role: 'murid' 
      },
      { 
        name: 'Wahyu Nugroho', 
        email: 'wahyu.nugroho@siswa.sdn3sby.sch.id', 
        phone: '0855-4433-2211', 
        role: 'murid' 
      }
    ];
    
    for (const user of users) {
      await db.run(
        'INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.phone, user.role]
      );
    }
    
    // Add rooms for each school
    console.log('Adding rooms...');
    
    // Get school IDs
    const schoolRows = await db.all('SELECT id, name FROM schools');
    
    // Get user IDs by role for room assignment
    const adminUsers = await db.all("SELECT id FROM users WHERE role = 'admin'");
    const kepalaSekolahUsers = await db.all("SELECT id, email FROM users WHERE role = 'kepala_sekolah'");
    const guruUsers = await db.all("SELECT id, email FROM users WHERE role = 'guru'");
    const staffUsers = await db.all("SELECT id FROM users WHERE role = 'staff'");
    
    // Function to get appropriate kepala sekolah for a school
    const getKepalaSekolahForSchool = (schoolName) => {
      // Extract simple code from school name (e.g., "SMA Negeri 1 Jakarta" -> "jakarta")
      const schoolCode = schoolName.toLowerCase().split(' ').pop();
      const kepala = kepalaSekolahUsers.find(u => u.email && u.email.includes(schoolCode));
      return kepala ? kepala.id : kepalaSekolahUsers[0].id;
    };
    
    // Function to get appropriate guru for a school
    const getGuruForSchool = (schoolName) => {
      // Extract simple code from school name (e.g., "SMA Negeri 1 Jakarta" -> "jakarta")
      const schoolCode = schoolName.toLowerCase().split(' ').pop();
      const guru = guruUsers.find(u => u.email && u.email.includes(schoolCode));
      return guru ? guru.id : guruUsers[0].id;
    };
    
    // Function to get appropriate staff for a school
    const getStaffForSchool = (schoolName) => {
      // Extract simple code from school name (e.g., "SMA Negeri 1 Jakarta" -> "jakarta")
      const schoolCode = schoolName.toLowerCase().split(' ').pop();
      const staff = staffUsers.find(u => u.email && u.email.includes(schoolCode));
      return staff ? staff.id : staffUsers[0].id;
    };
    
    for (const school of schoolRows) {
      const schoolCode = school.name.toLowerCase().replace(/\s+/g, '');
      
      // Add ruang kelas
      for (let i = 1; i <= 3; i++) {
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Kelas ${i}A`, school.id, 1, 1, getGuruForSchool(school.name), '1', 'Gedung Utama']
        );
        
        await db.run(
          'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`Kelas ${i}B`, school.id, 1, 1, getGuruForSchool(school.name), '1', 'Gedung Utama']
        );
      }
      
      // Add laboratorium
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Laboratorium IPA', school.id, 1, 2, getGuruForSchool(school.name), '2', 'Gedung Utama']
      );
      
      // Add perpustakaan
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Perpustakaan', school.id, 1, 3, getStaffForSchool(school.name), '1', 'Gedung Timur']
      );
      
      // Add ruang guru
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Ruang Guru', school.id, 1, 4, getKepalaSekolahForSchool(school.name), '1', 'Gedung Utama']
      );
      
      // Add ruang kepala sekolah
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Ruang Kepala Sekolah', school.id, 1, 4, getKepalaSekolahForSchool(school.name), '1', 'Gedung Utama']
      );
      
      // Add gudang
      await db.run(
        'INSERT INTO rooms (name, school_id, status_id, type_id, responsible_user_id, floor, building) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Gudang', school.id, 1, 6, getStaffForSchool(school.name), 'B', 'Gedung Utama']
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
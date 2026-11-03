const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function init() {
  console.log('🔧 Initializing database...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      subtitle VARCHAR(100),
      title VARCHAR(100) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      slide_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      icon VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      service_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      subtitle VARCHAR(100),
      description TEXT,
      vehicle_type VARCHAR(50),
      service_type VARCHAR(100),
      duration VARCHAR(50),
      completed_date VARCHAR(50),
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      image_order INTEGER DEFAULT 0,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS about_content (
      id SERIAL PRIMARY KEY,
      section VARCHAR(50) UNIQUE NOT NULL,
      content JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_info (
      id SERIAL PRIMARY KEY,
      address TEXT NOT NULL DEFAULT '',
      phone VARCHAR(30) NOT NULL DEFAULT '',
      email VARCHAR(100) NOT NULL DEFAULT '',
      working_hours VARCHAR(100) NOT NULL DEFAULT '',
      maps_link VARCHAR(500) DEFAULT '',
      whatsapp_link VARCHAR(500) DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables ready');

  // Seed admin
  const adminCheck = await pool.query("SELECT id FROM admin_users WHERE username='admin'");
  if (adminCheck.rows.length === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      "INSERT INTO admin_users (username,email,password,full_name) VALUES ($1,$2,$3,$4)",
      ['admin', 'admin@worksglow.com', hashed, 'Administrator']
    );
    console.log('✅ Admin created: admin / admin123');
  }

  // Seed hero slides
  const heroCheck = await pool.query("SELECT id FROM hero_slides LIMIT 1");
  if (heroCheck.rows.length === 0) {
    const slides = [
      { subtitle: 'Make A Desire',        title: 'WORKS GLOW',     desc: 'Bengkel Cat Profesional dengan Kualitas Premium', order: 1 },
      { subtitle: 'Professional Service', title: 'PREMIUM QUALITY', desc: 'Hasil Cat Terbaik dengan Teknologi Modern',        order: 2 },
      { subtitle: 'Expert Team',          title: 'SATISFACTION',   desc: 'Kepuasan Pelanggan adalah Prioritas Utama',        order: 3 },
    ];
    for (const s of slides) {
      await pool.query(
        "INSERT INTO hero_slides (subtitle,title,description,slide_order) VALUES ($1,$2,$3,$4)",
        [s.subtitle, s.title, s.desc, s.order]
      );
    }
    console.log('✅ Hero slides seeded');
  }

  // Seed services
  const svcCheck = await pool.query("SELECT id FROM services LIMIT 1");
  if (svcCheck.rows.length === 0) {
    const services = [
      { icon:'fa-car',         title:'Cat Mobil',        desc:'Layanan cat mobil profesional dengan hasil sempurna dan tahan lama.',           order:1 },
      { icon:'fa-motorcycle',  title:'Cat Motor',        desc:'Spesialis cat motor dengan berbagai pilihan warna dan finishing.',              order:2 },
      { icon:'fa-tools',       title:'Body Repair',      desc:'Layanan perbaikan body kendaraan dengan teknik terbaik.',                       order:3 },
      { icon:'fa-palette',     title:'Custom Paint',     desc:'Desain cat custom sesuai keinginan Anda. Dari airbrush hingga grafis kompleks.',order:4 },
      { icon:'fa-shield-alt',  title:'Paint Protection', desc:'Layanan perlindungan cat kendaraan dengan coating berkualitas tinggi.',         order:5 },
      { icon:'fa-certificate', title:'Warranty',         desc:'Garansi resmi untuk setiap pekerjaan kami.',                                   order:6 },
    ];
    for (const s of services) {
      await pool.query(
        "INSERT INTO services (icon,title,description,service_order) VALUES ($1,$2,$3,$4)",
        [s.icon, s.title, s.desc, s.order]
      );
    }
    console.log('✅ Services seeded');
  }

  // Seed contact
  const ctCheck = await pool.query("SELECT id FROM contact_info LIMIT 1");
  if (ctCheck.rows.length === 0) {
    await pool.query(
      "INSERT INTO contact_info (address,phone,email,working_hours,maps_link,whatsapp_link) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        'Jl. Pasir Pogor Raya No.7 Blok DD No.6, Mekarjaya, Kec. Rancasari, Kota Bandung, Jawa Barat 40292',
        '+62 856-0629-6686', 'info@worksglow.com', 'Senin - Sabtu: 08:00 - 17:00',
        'https://maps.app.goo.gl/SkXTYsDLL7NzeyRz5', 'https://wa.me/6285606296686'
      ]
    );
    console.log('✅ Contact seeded');
  }

  // Seed about content
  const aboutCheck = await pool.query("SELECT id FROM about_content LIMIT 1");
  if (aboutCheck.rows.length === 0) {
    const sections = {
      hero:    { title:'Tentang Works Glow', subtitle:'Bengkel cat profesional yang telah dipercaya sejak 2015' },
      history: { title:'Sejarah Kami', paragraphs:['Works Glow didirikan pada tahun 2015 dengan visi menjadi bengkel cat terdepan di Indonesia.','Dengan pengalaman lebih dari 8 tahun, kami telah menangani ribuan kendaraan.','Kepercayaan pelanggan adalah aset terbesar kami.'] },
      vision:  { title:'Visi', content:'Menjadi bengkel cat kendaraan terdepan di Indonesia yang dikenal dengan kualitas premium.' },
      mission: { title:'Misi', content:'Memberikan layanan cat kendaraan berkualitas tinggi dengan menggunakan teknologi terdepan.' },
      values:  { title:'Nilai-Nilai Kami', subtitle:'Prinsip yang menjadi fondasi', items:[
        {icon:'fa-star',title:'Kualitas Premium',description:'Menggunakan cat dan material terbaik dengan standar internasional.'},
        {icon:'fa-users',title:'Profesionalisme',description:'Tim ahli dengan pengalaman bertahun-tahun.'},
        {icon:'fa-lightbulb',title:'Inovasi',description:'Selalu mengikuti perkembangan teknologi terbaru.'},
        {icon:'fa-clock',title:'Ketepatan Waktu',description:'Menghargai waktu pelanggan.'},
        {icon:'fa-handshake',title:'Integritas',description:'Berkomitmen pada kejujuran dan transparansi.'},
        {icon:'fa-heart',title:'Passion',description:'Mengerjakan setiap proyek dengan dedikasi tinggi.'}
      ]},
      stats: { title:'Works Glow dalam Angka', subtitle:'Prestasi sepanjang perjalanan kami', items:[
        {number:'8+',label:'Tahun Pengalaman'},{number:'2500+',label:'Kendaraan Ditangani'},
        {number:'98%',label:'Kepuasan Pelanggan'},{number:'15+',label:'Tim Profesional'}
      ]}
    };
    for (const [section, content] of Object.entries(sections)) {
      await pool.query(
        "INSERT INTO about_content (section,content) VALUES ($1,$2::jsonb) ON CONFLICT (section) DO NOTHING",
        [section, JSON.stringify(content)]
      );
    }
    console.log('✅ About content seeded');
  }

  console.log('✅ Database initialization complete!');
  process.exit(0);
}

init().catch(e => { console.error('❌ Init failed:', e); process.exit(1); });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // set this in Vercel env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile, curl, same-origin on Vercel)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/hero',     require('./routes/hero'));
app.use('/api/services', require('./routes/services'));
app.use('/api/gallery',  require('./routes/gallery'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/about',    require('./routes/about'));

app.get('/api/test', (req, res) => res.json({ status: 'success', message: 'WorksGlow V2 API running' }));

// One-time DB init endpoint (protected by secret key)
app.get('/api/init-db', async (req, res) => {
  if (req.query.secret !== process.env.INIT_SECRET && req.query.secret !== 'worksglow-init-2025') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  try {
    const { pool } = require('./config/db');
    const bcrypt = require('bcryptjs');

    await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, full_name VARCHAR(100), bio TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS hero_slides (id SERIAL PRIMARY KEY, subtitle VARCHAR(100), title VARCHAR(100) NOT NULL, description TEXT, image_url VARCHAR(500), slide_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, icon VARCHAR(50) NOT NULL, title VARCHAR(100) NOT NULL, description TEXT NOT NULL, service_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS gallery_projects (id SERIAL PRIMARY KEY, title VARCHAR(100) NOT NULL, subtitle VARCHAR(100), description TEXT, vehicle_type VARCHAR(50), service_type VARCHAR(100), duration VARCHAR(50), completed_date VARCHAR(50), display_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS gallery_images (id SERIAL PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE, image_url VARCHAR(500) NOT NULL, image_order INTEGER DEFAULT 0, is_primary BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS about_content (id SERIAL PRIMARY KEY, section VARCHAR(50) UNIQUE NOT NULL, content JSONB NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS contact_info (id SERIAL PRIMARY KEY, address TEXT NOT NULL DEFAULT '', phone VARCHAR(30) NOT NULL DEFAULT '', email VARCHAR(100) NOT NULL DEFAULT '', working_hours VARCHAR(100) NOT NULL DEFAULT '', maps_link VARCHAR(500) DEFAULT '', whatsapp_link VARCHAR(500) DEFAULT '', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    // Seed admin
    const adminCheck = await pool.query("SELECT id FROM admin_users WHERE username='admin'");
    if (adminCheck.rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await pool.query("INSERT INTO admin_users (username,email,password,full_name) VALUES ($1,$2,$3,$4)", ['admin','admin@worksglow.com',hashed,'Administrator']);
    }

    // Seed hero
    const heroCheck = await pool.query("SELECT id FROM hero_slides LIMIT 1");
    if (heroCheck.rows.length === 0) {
      const slides = [
        ['Make A Desire','WORKS GLOW','Bengkel Cat Profesional dengan Kualitas Premium',1],
        ['Professional Service','PREMIUM QUALITY','Hasil Cat Terbaik dengan Teknologi Modern',2],
        ['Expert Team','SATISFACTION','Kepuasan Pelanggan adalah Prioritas Utama',3],
      ];
      for (const s of slides) await pool.query("INSERT INTO hero_slides (subtitle,title,description,slide_order) VALUES ($1,$2,$3,$4)", s);
    }

    // Seed services
    const svcCheck = await pool.query("SELECT id FROM services LIMIT 1");
    if (svcCheck.rows.length === 0) {
      const svcs = [
        ['fa-car','Cat Mobil','Layanan cat mobil profesional dengan hasil sempurna dan tahan lama.',1],
        ['fa-motorcycle','Cat Motor','Spesialis cat motor dengan berbagai pilihan warna dan finishing.',2],
        ['fa-tools','Body Repair','Layanan perbaikan body kendaraan dengan teknik terbaik.',3],
        ['fa-palette','Custom Paint','Desain cat custom sesuai keinginan Anda.',4],
        ['fa-shield-alt','Paint Protection','Layanan perlindungan cat kendaraan dengan coating berkualitas tinggi.',5],
        ['fa-certificate','Warranty','Garansi resmi untuk setiap pekerjaan kami.',6],
      ];
      for (const s of svcs) await pool.query("INSERT INTO services (icon,title,description,service_order) VALUES ($1,$2,$3,$4)", s);
    }

    // Seed contact
    const ctCheck = await pool.query("SELECT id FROM contact_info LIMIT 1");
    if (ctCheck.rows.length === 0) {
      await pool.query("INSERT INTO contact_info (address,phone,email,working_hours,maps_link,whatsapp_link) VALUES ($1,$2,$3,$4,$5,$6)",
        ['Jl. Pasir Pogor Raya No.7 Blok DD No.6, Mekarjaya, Kec. Rancasari, Kota Bandung, Jawa Barat 40292','+62 856-0629-6686','info@worksglow.com','Senin - Sabtu: 08:00 - 17:00','https://maps.app.goo.gl/SkXTYsDLL7NzeyRz5','https://wa.me/6285606296686']);
    }

    res.json({ status: 'success', message: 'Database initialized! Login: admin / admin123' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ status: 'error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ WorksGlow V2 Backend running on http://localhost:${PORT}`);
});

module.exports = app;

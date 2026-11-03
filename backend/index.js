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

const router = require('express').Router();
const { query } = require('../config/db');
const auth = require('../middleware/auth');
const makeUpload = require('../middleware/upload');
const { put } = require('@vercel/blob');

const upload = makeUpload('hero', 'images', 10);

async function uploadToBlob(file, folder = 'hero') {
  const ext = file.originalname.split('.').pop();
  const filename = `${folder}/${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const blob = await put(filename, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

// GET /api/hero
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hero_slides WHERE is_active=true ORDER BY slide_order ASC');
    const data = {};
    result.rows.forEach(r => { data[`slide${r.slide_order}`] = r; });
    res.json({ status: 'success', data });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST /api/hero/update
router.post('/update', auth, upload, async (req, res) => {
  try {
    const body = req.body;
    const files = req.files || [];

    for (let i = 1; i <= 3; i++) {
      const file = files.find(f => f.fieldname === `hero${i}Image`);
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadToBlob(file, 'hero');
      }

      await query(
        `UPDATE hero_slides SET subtitle=$1, title=$2, description=$3,
         image_url=COALESCE($4, image_url), updated_at=NOW()
         WHERE slide_order=$5`,
        [body[`hero${i}Subtitle`], body[`hero${i}Title`], body[`hero${i}Description`], imageUrl, i]
      );
    }

    const result = await query('SELECT * FROM hero_slides WHERE is_active=true ORDER BY slide_order ASC');
    const data = {};
    result.rows.forEach(r => { data[`slide${r.slide_order}`] = r; });
    res.json({ status: 'success', data });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

module.exports = router;

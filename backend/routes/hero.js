const router = require('express').Router();
const { query } = require('../config/db');
const auth = require('../middleware/auth');
const makeUpload = require('../middleware/upload');

const upload = makeUpload('hero', 'images', 10);

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
    const fileMap = {};
    files.forEach(f => { fileMap[f.fieldname] = f; });

    for (let i = 1; i <= 3; i++) {
      const file = req.files && req.files.find(f => f.fieldname === `hero${i}Image`);
      const imageUrl = file ? `/uploads/hero/${file.filename}` : null;

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

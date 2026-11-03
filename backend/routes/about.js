const router = require('express').Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT section,content FROM about_content ORDER BY id ASC');
    const data = {};
    result.rows.forEach(r => { data[r.section] = typeof r.content === 'string' ? JSON.parse(r.content) : r.content; });
    res.json({ status: 'success', data });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

router.post('/update', auth, async (req, res) => {
  try {
    const { sections } = req.body;
    for (const [section, content] of Object.entries(sections)) {
      await pool.query(
        `INSERT INTO about_content (section,content,updated_at) VALUES ($1,$2::jsonb,NOW())
         ON CONFLICT (section) DO UPDATE SET content=EXCLUDED.content, updated_at=NOW()`,
        [section, JSON.stringify(content)]
      );
    }
    res.json({ status: 'success', message: 'Updated' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

module.exports = router;

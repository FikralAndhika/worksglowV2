const router = require('express').Router();
const { query } = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services WHERE is_active=true ORDER BY service_order ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

router.post('/update', auth, async (req, res) => {
  try {
    const { services } = req.body;
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      await query(
        'UPDATE services SET icon=$1,title=$2,description=$3,updated_at=NOW() WHERE service_order=$4',
        [s.icon, s.title, s.description, i + 1]
      );
    }
    const result = await query('SELECT * FROM services WHERE is_active=true ORDER BY service_order ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

module.exports = router;

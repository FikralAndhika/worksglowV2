const router = require('express').Router();
const { query } = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM contact_info ORDER BY id DESC LIMIT 1');
    if (!result.rows.length) return res.status(404).json({ status: 'error', message: 'Not found' });
    const r = result.rows[0];
    res.json({ status: 'success', data: {
      address: r.address, phone: r.phone, email: r.email,
      hours: r.working_hours, mapsLink: r.maps_link,
      whatsapp: (r.whatsapp_link || '').replace('https://wa.me/', '')
    }});
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

router.post('/update', auth, async (req, res) => {
  try {
    const { address, phone, email, hours, mapsLink, whatsapp } = req.body;
    const waLink = whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g,'')}`;
    const existing = await query('SELECT id FROM contact_info LIMIT 1');
    if (existing.rows.length) {
      await query(
        'UPDATE contact_info SET address=$1,phone=$2,email=$3,working_hours=$4,maps_link=$5,whatsapp_link=$6,updated_at=NOW() WHERE id=$7',
        [address, phone, email, hours, mapsLink, waLink, existing.rows[0].id]
      );
    } else {
      await query(
        'INSERT INTO contact_info (address,phone,email,working_hours,maps_link,whatsapp_link) VALUES ($1,$2,$3,$4,$5,$6)',
        [address, phone, email, hours, mapsLink, waLink]
      );
    }
    res.json({ status: 'success', data: { address, phone, email, hours, mapsLink, whatsapp } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

module.exports = router;

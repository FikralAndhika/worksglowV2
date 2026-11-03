const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ status: 'error', message: 'Username and password required' });

    const result = await pool.query('SELECT * FROM admin_users WHERE username=$1', [username]);
    if (!result.rows.length)
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ status: 'success', data: { token, user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name } } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,username,email,full_name,bio,created_at FROM admin_users WHERE id=$1',
      [req.user.id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { full_name, bio } = req.body;
    const result = await pool.query(
      'UPDATE admin_users SET full_name=$1,bio=$2,updated_at=NOW() WHERE id=$3 RETURNING id,username,email,full_name,bio',
      [full_name, bio, req.user.id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ status: 'error', message: 'Both passwords required' });
    if (newPassword.length < 6)
      return res.status(400).json({ status: 'error', message: 'Min 6 characters' });

    const result = await pool.query('SELECT * FROM admin_users WHERE id=$1', [req.user.id]);
    const user = result.rows[0];
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ status: 'error', message: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admin_users SET password=$1,updated_at=NOW() WHERE id=$2', [hashed, req.user.id]);
    res.json({ status: 'success', message: 'Password changed' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

module.exports = router;

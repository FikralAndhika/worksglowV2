const router = require('express').Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const makeUpload = require('../middleware/upload');
const { put, del } = require('@vercel/blob');

const upload = makeUpload('gallery', 'images', 50);
const uploadNew = makeUpload('gallery', 'newImages', 50);

// Upload a buffer to Vercel Blob and return public URL
async function uploadToBlob(file, folder = 'gallery') {
  const ext = file.originalname.split('.').pop();
  const filename = `${folder}/${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const blob = await put(filename, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const projects = await pool.query(
      'SELECT * FROM gallery_projects WHERE is_active=true ORDER BY display_order ASC, created_at DESC'
    );
    const data = await Promise.all(projects.rows.map(async p => {
      const imgs = await pool.query(
        'SELECT * FROM gallery_images WHERE project_id=$1 ORDER BY image_order ASC', [p.id]
      );
      return { ...p, images: imgs.rows };
    }));
    res.json({ status: 'success', data });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// GET /api/gallery/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await pool.query('SELECT * FROM gallery_projects WHERE id=$1', [req.params.id]);
    if (!p.rows.length) return res.status(404).json({ status: 'error', message: 'Not found' });
    const imgs = await pool.query('SELECT * FROM gallery_images WHERE project_id=$1 ORDER BY image_order ASC', [req.params.id]);
    res.json({ status: 'success', data: { ...p.rows[0], images: imgs.rows } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// POST /api/gallery/create
router.post('/create', auth, upload, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { title, subtitle, description, vehicle_type, service_type, duration, completed_date, display_order = 0 } = req.body;

    const proj = await client.query(
      `INSERT INTO gallery_projects (title,subtitle,description,vehicle_type,service_type,duration,completed_date,display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, subtitle, description, vehicle_type, service_type, duration, completed_date, display_order]
    );
    const project = proj.rows[0];

    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      const imageUrl = await uploadToBlob(files[i], 'gallery');
      await client.query(
        'INSERT INTO gallery_images (project_id,image_url,image_order,is_primary) VALUES ($1,$2,$3,$4)',
        [project.id, imageUrl, i, i === 0]
      );
    }

    await client.query('COMMIT');
    const imgs = await pool.query('SELECT * FROM gallery_images WHERE project_id=$1 ORDER BY image_order ASC', [project.id]);
    res.json({ status: 'success', data: { ...project, images: imgs.rows } });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    client.release();
  }
});

// POST /api/gallery/update/:id
router.post('/update/:id', auth, uploadNew, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = parseInt(req.params.id);
    const { title, subtitle, description, vehicle_type, service_type, duration, completed_date, display_order, deleted_images } = req.body;

    // Update project fields
    const updates = [];
    const vals = [];
    let idx = 1;
    const fields = { title, subtitle, description, vehicle_type, service_type, duration, completed_date, display_order };
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined && v !== '') { updates.push(`${k}=$${idx++}`); vals.push(v); }
    }
    if (updates.length) {
      updates.push(`updated_at=NOW()`);
      vals.push(id);
      await client.query(`UPDATE gallery_projects SET ${updates.join(',')} WHERE id=$${idx}`, vals);
    }

    // Delete marked images from Blob and DB
    if (deleted_images) {
      const ids = JSON.parse(deleted_images);
      if (ids.length) {
        const imgRows = await client.query('SELECT image_url FROM gallery_images WHERE id=ANY($1::int[])', [ids]);
        for (const r of imgRows.rows) {
          try { await del(r.image_url); } catch {}
        }
        await client.query('DELETE FROM gallery_images WHERE id=ANY($1::int[])', [ids]);
      }
    }

    // Add new images to Blob
    const files = req.files || [];
    if (files.length) {
      const maxRes = await client.query('SELECT COALESCE(MAX(image_order),-1) AS m FROM gallery_images WHERE project_id=$1', [id]);
      let nextOrder = maxRes.rows[0].m + 1;
      for (const file of files) {
        const imageUrl = await uploadToBlob(file, 'gallery');
        await client.query(
          'INSERT INTO gallery_images (project_id,image_url,image_order,is_primary) VALUES ($1,$2,$3,$4)',
          [id, imageUrl, nextOrder++, false]
        );
      }
    }

    await client.query('COMMIT');
    const proj = await pool.query('SELECT * FROM gallery_projects WHERE id=$1', [id]);
    const imgs = await pool.query('SELECT * FROM gallery_images WHERE project_id=$1 ORDER BY image_order ASC', [id]);
    res.json({ status: 'success', data: { ...proj.rows[0], images: imgs.rows } });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    client.release();
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const imgs = await client.query('SELECT image_url FROM gallery_images WHERE project_id=$1', [req.params.id]);
    for (const r of imgs.rows) {
      try { await del(r.image_url); } catch {}
    }
    await client.query('DELETE FROM gallery_projects WHERE id=$1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ status: 'success', message: 'Deleted' });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;

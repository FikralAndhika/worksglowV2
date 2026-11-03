const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeUpload(subfolder, fieldname = 'images', maxCount = 10) {
  const dest = path.join(__dirname, '..', 'public', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subfolder}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, allowed.includes(file.mimetype)),
  });

  return maxCount === 1 ? upload.single(fieldname) : upload.array(fieldname, maxCount);
}

module.exports = makeUpload;

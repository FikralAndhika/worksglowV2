const multer = require('multer');

// Use memory storage — files go to Vercel Blob, not disk
function makeUpload(subfolder, fieldname = 'images', maxCount = 10) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, allowed.includes(file.mimetype)),
  });

  return maxCount === 1 ? upload.single(fieldname) : upload.array(fieldname, maxCount);
}

module.exports = makeUpload;

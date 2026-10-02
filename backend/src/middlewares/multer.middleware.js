const multer = require('multer');

const MAX_MB = Number(process.env.MAX_UPLOAD_MB) || 5
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

// Keep uploads in memory: they go straight to OCR, so there are no temp files to clean up
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED.includes(file.mimetype)) return cb(null, true)
        cb(Object.assign(new Error('Unsupported file type. Upload a PDF, PNG, JPG or WEBP'), { status: 415 }))
    },
})

module.exports = upload;
module.exports.MAX_MB = MAX_MB;

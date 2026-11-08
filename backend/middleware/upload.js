const multer = require('multer');

// Memory storage to process files as buffers for direct Cloudinary streaming
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit to prevent Vercel serverless function timeouts
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types: pdf, jpeg, jpg, png
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files (JPG, PNG) are allowed.'), false);
    }
  }
});

module.exports = upload;

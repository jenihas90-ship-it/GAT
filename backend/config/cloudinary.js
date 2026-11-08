const cloudinary = require('cloudinary').v2;
const streamifier = require('stream');

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads an in-memory buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string>} - Resolves to the secure URL
 */
const uploadBufferToCloudinary = (buffer, folder = 'candidate_passports') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary isn't configured in development, provide fallback simulation
    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('⚠️ Cloudinary credentials missing. Returning local placeholder URL.');
      return resolve(`https://placeholder.vault/passports/${Date.now()}-mock-passport.pdf`);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary
};

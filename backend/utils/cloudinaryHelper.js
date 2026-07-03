const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Uploads a local file to Cloudinary.
 * If successful, returns the Cloudinary secure URL.
 * If Cloudinary fails, returns the local path as a fallback.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Image URL or path
 */
const uploadToCloudinary = async (file) => {
  if (!file) return '';

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'mosque_directory',
      resource_type: 'image'
    });

    // Delete local file after successful Cloudinary upload to free up disk space
    // and keep backend tidy. If you want to keep the local file as well, uncomment the static check.
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Failed to delete local temp file:', err);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed, using local fallback:', error.message);
    // Fallback: return the local static server path format (e.g. /uploads/filename.jpg)
    return `/uploads/${file.filename}`;
  }
};

module.exports = { uploadToCloudinary };

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'dwtjjn9jw',
  api_key: process.env.CLOUDINARY_API_KEY || '177639926536866',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'jE7l3jVLHhi6X4LgXTdHKlXJUoU',
});

module.exports = cloudinary;

const express = require('express');
const router = express.Router();
const {
  getMyMosque,
  updateMyMosque,
  uploadMosqueImage,
  getMyMosqueTimings,
  updateMyMosqueTimings,
  getPublicMosques,
  getPublicMosqueDetails,
  getNearbyMosques,
  uploadMosqueGallery,
  deleteMosqueGalleryImage,
  getHadithOfTheDay
} = require('../controllers/mosqueController');
const { authenticateUser, authorizeMosqueAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/public/mosques', getPublicMosques);
router.get('/public/mosques/:id', getPublicMosqueDetails);
router.get('/public/mosques-nearby', getNearbyMosques);
router.get('/public/hadith-of-the-day', getHadithOfTheDay);

// ==========================================
// PRIVATE MOSQUE ADMIN ROUTES (prefixed with /mosque)
// ==========================================
router.route('/mosque/my-mosque')
  .get(authenticateUser, authorizeMosqueAdmin, getMyMosque)
  .put(authenticateUser, authorizeMosqueAdmin, updateMyMosque);

router.post(
  '/mosque/my-mosque/upload-image',
  authenticateUser,
  authorizeMosqueAdmin,
  upload.single('image'),
  uploadMosqueImage
);

router.post(
  '/mosque/my-mosque/upload-gallery',
  authenticateUser,
  authorizeMosqueAdmin,
  upload.array('images', 10),
  uploadMosqueGallery
);

router.delete(
  '/mosque/my-mosque/gallery',
  authenticateUser,
  authorizeMosqueAdmin,
  deleteMosqueGalleryImage
);

router.route('/mosque/my-mosque/timings')
  .get(authenticateUser, authorizeMosqueAdmin, getMyMosqueTimings)
  .put(authenticateUser, authorizeMosqueAdmin, updateMyMosqueTimings);

module.exports = router;

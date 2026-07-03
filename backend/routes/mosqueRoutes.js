const express = require('express');
const router = express.Router();
const {
  getMyMosque,
  updateMyMosque,
  uploadMosqueImage,
  getMyMosqueTimings,
  updateMyMosqueTimings,
  getPublicMosques,
  getPublicMosqueDetails
} = require('../controllers/mosqueController');
const { authenticateUser, authorizeMosqueAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/public/mosques', getPublicMosques);
router.get('/public/mosques/:id', getPublicMosqueDetails);

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

router.route('/mosque/my-mosque/timings')
  .get(authenticateUser, authorizeMosqueAdmin, getMyMosqueTimings)
  .put(authenticateUser, authorizeMosqueAdmin, updateMyMosqueTimings);

module.exports = router;

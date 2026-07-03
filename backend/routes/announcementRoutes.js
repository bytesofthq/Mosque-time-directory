const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  getMyAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authenticateUser, authorizeMosqueAdmin, authorizeRootAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// ROOT ADMIN ANNOUNCEMENT ROUTES
// ==========================================
router.get('/all', authenticateUser, authorizeRootAdmin, getAllAnnouncements);
router.delete('/all/:id', authenticateUser, authorizeRootAdmin, deleteAnnouncement);

// ==========================================
// MOSQUE ADMIN ANNOUNCEMENT ROUTES
// ==========================================
// Check and apply authenticateUser first, then authorizeMosqueAdmin
router.use(authenticateUser, authorizeMosqueAdmin);

router.route('/my-mosque')
  .get(getMyAnnouncements)
  .post(upload.single('image'), createAnnouncement);

router.route('/my-mosque/:id')
  .put(upload.single('image'), updateAnnouncement)
  .delete(deleteAnnouncement);

module.exports = router;

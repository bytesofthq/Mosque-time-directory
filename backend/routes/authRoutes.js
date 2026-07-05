const express = require('express');
const router = express.Router();
const {
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  registerAdminWithMosque
} = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', loginUser);
router.post('/register-mosque', registerAdminWithMosque);

// Protected routes (any logged-in user can access)
router.route('/profile')
  .get(authenticateUser, getUserProfile)
  .put(authenticateUser, updateUserProfile);

router.put('/change-password', authenticateUser, changePassword);

module.exports = router;

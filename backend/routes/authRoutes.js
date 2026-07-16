const express = require('express');
const router = express.Router();
const {
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  registerAdminWithMosque,
  registerUser,
  getSuggestedUsername,
  validateUsername
} = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const loginRateLimiter = require('../middlewares/rateLimiter');

// Public routes
router.post('/login', loginRateLimiter, loginUser);
router.post('/register-mosque', registerAdminWithMosque);
router.post('/register-user', registerUser);
router.get('/suggest-username', getSuggestedUsername);
router.get('/validate-username', validateUsername);

// Protected routes (any logged-in user can access)
router.route('/profile')
  .get(authenticateUser, getUserProfile)
  .put(authenticateUser, updateUserProfile);

router.put('/change-password', authenticateUser, changePassword);

module.exports = router;


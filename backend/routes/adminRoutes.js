const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createMosque,
  updateMosque,
  deleteMosque,
  getMosques,
  getMosqueAdmins,
  createAndAssignAdmin,
  toggleAdminStatus,
  resetAdminPassword
} = require('../controllers/adminController');
const { authenticateUser, authorizeRootAdmin } = require('../middlewares/authMiddleware');

// All routes here are protected and require Root Admin permissions
router.use(authenticateUser, authorizeRootAdmin);

router.get('/stats', getDashboardStats);

router.route('/mosques')
  .get(getMosques)
  .post(createMosque);

router.route('/mosques/:id')
  .put(updateMosque)
  .delete(deleteMosque);

router.route('/admins')
  .get(getMosqueAdmins)
  .post(createAndAssignAdmin);

router.put('/admins/:id/status', toggleAdminStatus);
router.put('/admins/:id/reset-password', resetAdminPassword);

module.exports = router;

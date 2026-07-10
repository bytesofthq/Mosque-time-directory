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
  updateUser,
  deleteUser,
  toggleAdminStatus,
  resetAdminPassword,
  getUnassignedUsers,
  getMosqueTimings,
  updateMosqueTimings,
  uploadMosqueImageByAdmin
} = require('../controllers/adminController');
const { authenticateUser, authorizeRootAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All routes here are protected and require Root Admin permissions
router.use(authenticateUser, authorizeRootAdmin);

router.get('/stats', getDashboardStats);
router.get('/unassigned-users', getUnassignedUsers);

router.route('/mosques')
  .get(getMosques)
  .post(createMosque);

router.route('/mosques/:id')
  .put(updateMosque)
  .delete(deleteMosque);

router.post(
  '/mosques/:id/upload-image',
  upload.single('image'),
  uploadMosqueImageByAdmin
);

router.route('/mosques/:mosqueId/timings')
  .get(getMosqueTimings)
  .put(updateMosqueTimings);

router.route('/admins')
  .get(getMosqueAdmins)
  .post(createAndAssignAdmin);

router.route('/admins/:id')
  .put(updateUser)
  .delete(deleteUser);

router.put('/admins/:id/status', toggleAdminStatus);
router.put('/admins/:id/reset-password', resetAdminPassword);

module.exports = router;

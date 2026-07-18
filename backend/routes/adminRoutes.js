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
  uploadMosqueImageByAdmin,
  bulkDeleteUsers,
  bulkActivateUsers,
  bulkDeactivateUsers
} = require('../controllers/adminController');
const { authenticateUser, authorizeRootAdmin, authorizeAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All admin routes require authentication
router.use(authenticateUser);

// --- Mosque Management Routes (Root Admin & Admin) ---
router.route('/mosques')
  .get(authorizeAdmin, getMosques)
  .post(authorizeAdmin, createMosque);

router.route('/mosques/:id')
  .put(authorizeAdmin, updateMosque)
  .delete(authorizeAdmin, deleteMosque);

router.post(
  '/mosques/:id/upload-image',
  authorizeAdmin,
  upload.single('image'),
  uploadMosqueImageByAdmin
);

router.route('/mosques/:mosqueId/timings')
  .get(authorizeAdmin, getMosqueTimings)
  .put(authorizeAdmin, updateMosqueTimings);

// --- Sole Root Admin Routes ---
router.use(authorizeRootAdmin);

router.get('/stats', getDashboardStats);
router.get('/unassigned-users', getUnassignedUsers);

router.route('/admins')
  .get(getMosqueAdmins)
  .post(createAndAssignAdmin);

router.route('/admins/:id')
  .put(updateUser)
  .delete(deleteUser);

router.put('/admins/:id/status', toggleAdminStatus);
router.put('/admins/:id/reset-password', resetAdminPassword);

// Bulk user management
router.post('/users/bulk-delete', bulkDeleteUsers);
router.post('/users/bulk-activate', bulkActivateUsers);
router.post('/users/bulk-deactivate', bulkDeactivateUsers);

module.exports = router;


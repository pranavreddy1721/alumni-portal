const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  getPendingAlumni,
  approveAlumni,
  toggleUserActive,
  deleteUser,
  createAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const isAdmin = authorize('admin', 'superadmin');
const isSuperAdmin = authorize('superadmin');

router.get('/stats', protect, isAdmin, getStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/pending-alumni', protect, isAdmin, getPendingAlumni);
router.put('/users/:id/approve', protect, isAdmin, approveAlumni);
router.put('/users/:id/toggle-active', protect, isAdmin, toggleUserActive);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.post('/create-admin', protect, isSuperAdmin, createAdmin);

module.exports = router;

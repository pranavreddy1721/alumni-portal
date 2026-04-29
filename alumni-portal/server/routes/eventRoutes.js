const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  deleteEvent,
  registerForEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadBanner } = require('../config/cloudinary');

router.get('/', protect, getAllEvents);
router.get('/:id', protect, getEventById);
router.post('/', protect, authorize('admin', 'superadmin', 'teacher', 'alumni'), uploadBanner.single('banner'), createEvent);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;

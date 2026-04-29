const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResume,
  getProfileById,
  searchAlumni,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar: avatarMiddleware, uploadResume: resumeMiddleware } = require('../config/cloudinary');

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/upload-avatar', protect, avatarMiddleware.single('avatar'), uploadAvatar);
router.post('/upload-resume', protect, resumeMiddleware.single('resume'), uploadResume);
router.get('/alumni/search', protect, searchAlumni);
router.get('/:userId', protect, getProfileById);

module.exports = router;

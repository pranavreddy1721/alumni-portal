const express = require('express');
const router  = express.Router();
const {
  getMyProfile, updateMyProfile, uploadAvatar, uploadResume,
  getProfileById, searchAlumni, searchTeachers, searchStudents,
} = require('../controllers/profileController');
const { protect }  = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadAvatar: avatarMW, uploadResume: resumeMW } = require('../config/cloudinary');

router.get('/me',                     protect, getMyProfile);
router.put('/me',                     protect, updateMyProfile);
router.post('/upload-avatar',         protect, avatarMW.single('avatar'), uploadAvatar);
router.post('/upload-resume',         protect, resumeMW.single('resume'), uploadResume);
router.get('/alumni/search',          protect, searchAlumni);
router.get('/teachers/search',        protect, authorize('student','alumni','admin','superadmin'), searchTeachers);
router.get('/students/search',        protect, authorize('teacher','alumni','admin','superadmin'), searchStudents);
router.get('/:userId',                protect, getProfileById);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getMyApplications,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getAllJobs);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.get('/:id', protect, getJobById);
router.post('/', protect, authorize('alumni', 'admin', 'superadmin'), createJob);
router.put('/:id', protect, authorize('alumni', 'admin', 'superadmin'), updateJob);
router.delete('/:id', protect, authorize('alumni', 'admin', 'superadmin'), deleteJob);
router.post('/:id/apply', protect, authorize('student'), applyForJob);

module.exports = router;

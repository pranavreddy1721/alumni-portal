const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;

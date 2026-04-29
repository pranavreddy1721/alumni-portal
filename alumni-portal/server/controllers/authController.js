const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const { otpEmailTemplate, welcomeEmailTemplate } = require('../utils/emailTemplates');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── helper: save hashed OTP ──────────────────────────────
const saveOTP = async (email, type) => {
  const otp = generateOTP();
  const hashed = await bcrypt.hash(otp, 10);
  await OTP.deleteMany({ email: email.toLowerCase(), type });
  await OTP.create({
    email: email.toLowerCase(),
    otp: hashed,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  return otp; // plain OTP to send via email
};

// ── helper: verify OTP ───────────────────────────────────
const verifyOTPRecord = async (email, otp, type) => {
  const record = await OTP.findOne({ email: email.toLowerCase(), type, isUsed: false });
  if (!record) return { error: 'OTP not found or already used. Request a new one.' };
  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    return { error: 'OTP has expired. Request a new one.' };
  }
  if (record.attempts >= 5) {
    await OTP.deleteOne({ _id: record._id });
    return { error: 'Too many wrong attempts. Request a new OTP.' };
  }
  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    await OTP.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
    const left = 4 - record.attempts;
    return { error: `Invalid OTP. ${left} attempt(s) remaining.` };
  }
  await OTP.findByIdAndUpdate(record._id, { isUsed: true });
  return { success: true };
};

// ════════════════════════════════════════════════════════
// POST /api/auth/register
// ════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (role === 'superadmin')
      return res.status(403).json({ message: 'Cannot register as superadmin.' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password, role, isEmailVerified: false });
    await Profile.create({ userId: user._id });

    const otp = await saveOTP(email, 'EMAIL_VERIFY');
    await sendEmail({
      to: email,
      subject: '🎓 Alumni Portal — Verify Your Email',
      html: otpEmailTemplate(name, otp, 'EMAIL_VERIFY'),
    });

    res.status(201).json({
      success: true,
      message: 'Registered! Check your email for the OTP verification code.',
      email: email.toLowerCase(),
    });
  } catch (err) {
    console.error('Register:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/verify-email
// ════════════════════════════════════════════════════════
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const result = await verifyOTPRecord(email, otp, 'EMAIL_VERIFY');
    if (result.error) return res.status(400).json({ message: result.error });

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isEmailVerified: true },
      { new: true }
    );

    // Send welcome email
    await sendEmail({
      to: email,
      subject: '🎉 Welcome to Alumni Portal!',
      html: welcomeEmailTemplate(user.name, user.role),
    });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Email verified! Welcome to Alumni Portal 🎉',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
    });
  } catch (err) {
    console.error('VerifyEmail:', err);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/resend-otp
// ════════════════════════════════════════════════════════
exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });
    if (type === 'EMAIL_VERIFY' && user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified.' });

    // 1-min cooldown between resends
    const recent = await OTP.findOne({
      email: email.toLowerCase(), type,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });
    if (recent) return res.status(429).json({ message: 'Please wait 1 minute before requesting a new OTP.' });

    const otp = await saveOTP(email, type);
    await sendEmail({
      to: email,
      subject: '🎓 Alumni Portal — New OTP',
      html: otpEmailTemplate(user.name, otp, type),
    });

    res.json({ success: true, message: 'New OTP sent to your email!' });
  } catch (err) {
    console.error('ResendOTP:', err);
    res.status(500).json({ message: 'Failed to resend OTP.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.isLocked()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${mins} minute(s).` });
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    if (!user.isEmailVerified)
      return res.status(401).json({ message: 'Verify your email before logging in.', needsVerification: true, email: user.email });
    if (user.role === 'alumni' && !user.isApproved)
      return res.status(401).json({ message: 'Your alumni account is pending admin approval.' });

    const match = await user.comparePassword(password);
    if (!match) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await User.findByIdAndUpdate(user._id, { $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Login:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/forgot-password
// ════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return same message (don't reveal if email exists)
    if (!user) return res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });

    const otp = await saveOTP(email, 'FORGOT_PASSWORD');
    await sendEmail({
      to: email,
      subject: '🔐 Alumni Portal — Password Reset OTP',
      html: otpEmailTemplate(user.name, otp, 'FORGOT_PASSWORD'),
    });

    res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('ForgotPassword:', err);
    res.status(500).json({ message: 'Request failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/verify-reset-otp
// ════════════════════════════════════════════════════════
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const result = await verifyOTPRecord(email, otp, 'FORGOT_PASSWORD');
    if (result.error) return res.status(400).json({ message: result.error });

    // Mark OTP as used but DON'T delete — will be checked in resetPassword
    res.json({ success: true, message: 'OTP verified. Proceed to set new password.' });
  } catch (err) {
    console.error('VerifyResetOTP:', err);
    res.status(500).json({ message: 'Verification failed.' });
  }
};

// ════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// ════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'All fields are required.' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    // Verify OTP again (double check)
    const result = await verifyOTPRecord(email, otp, 'FORGOT_PASSWORD');
    // Allow "already used" since verifyResetOTP already consumed it
    if (result.error && !result.error.includes('already used')) {
      return res.status(400).json({ message: result.error });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    // Clean up OTPs
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'FORGOT_PASSWORD' });

    res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (err) {
    console.error('ResetPassword:', err);
    res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
};

// ════════════════════════════════════════════════════════
// GET /api/auth/me
// ════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

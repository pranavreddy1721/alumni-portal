const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const { otpEmailTemplate } = require('../utils/emailTemplates');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isApproved: user.isApproved,
  isEmailVerified: user.isEmailVerified,
  avatar: user.avatar,
});

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body?.email);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot self-register as superadmin.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    console.log('✅ Creating user...');
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isEmailVerified: false,
    });
    console.log('✅ User created:', user._id);

    await Profile.create({ userId: user._id });
    console.log('✅ Profile created');

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.deleteMany({ email: email.toLowerCase(), type: 'EMAIL_VERIFY' });
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      type: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    console.log('✅ OTP saved to DB');

    // Send email - don't crash if fails
    try {
      await sendEmail({
        to: email,
        subject: '🎓 Alumni Portal — Verify Your Email',
        html: otpEmailTemplate(name, otp, 'EMAIL_VERIFY'),
      });
      console.log('✅ OTP email sent to', email);
    } catch (emailErr) {
      console.error('❌ Email send failed (non-fatal):', emailErr.message);
    }

    console.log('✅ Registration complete for', email);
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for OTP.',
      email: email.toLowerCase(),
    });

  } catch (err) {
    console.error('❌ Register error:', err.message, err.stack);
    return res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
};

// POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const record = await OTP.findOne({ email: email.toLowerCase(), type: 'EMAIL_VERIFY', isUsed: false });
    if (!record) return res.status(400).json({ message: 'OTP not found or already used. Request a new one.' });
    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (record.attempts >= 5) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Too many wrong attempts. Request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) {
      await OTP.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      const left = 4 - record.attempts;
      return res.status(400).json({ message: `Invalid OTP. ${left} attempt(s) remaining.` });
    }

    await OTP.findByIdAndUpdate(record._id, { isUsed: true });
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isEmailVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const token = generateToken(user._id);
    return res.json({
      success: true,
      message: '✅ Email verified! Welcome to Alumni Portal.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('VerifyEmail error:', err.message);
    return res.status(500).json({ message: 'Verification failed: ' + err.message });
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) return res.status(400).json({ message: 'Email and type are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });
    if (type === 'EMAIL_VERIFY' && user.isEmailVerified)
      return res.status(400).json({ message: 'Email already verified.' });

    await OTP.deleteMany({ email: email.toLowerCase(), type });

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: '🎓 Alumni Portal — Your New OTP',
      html: otpEmailTemplate(user.name, otp, type),
    });

    return res.json({ success: true, message: 'New OTP sent to your email!' });
  } catch (err) {
    console.error('ResendOTP error:', err.message);
    return res.status(500).json({ message: 'Failed to resend OTP: ' + err.message });
  }
};

// POST /api/auth/login
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
    if (!user.isEmailVerified) return res.status(401).json({
      message: 'Please verify your email before logging in.',
      needsVerification: true,
      email: user.email,
    });
    if (user.role === 'alumni' && !user.isApproved) return res.status(401).json({
      message: 'Your alumni account is pending admin approval.',
    });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });

    const token = generateToken(user._id);
    return res.json({ success: true, message: 'Login successful!', token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Login failed: ' + err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });

    await OTP.deleteMany({ email: email.toLowerCase(), type: 'FORGOT_PASSWORD' });
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOTP,
      type: 'FORGOT_PASSWORD',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendEmail({
        to: email,
        subject: '🔐 Alumni Portal — Password Reset OTP',
        html: otpEmailTemplate(user.name, otp, 'FORGOT_PASSWORD'),
      });
    } catch (emailErr) {
      console.error('❌ Forgot password email failed:', emailErr.message);
    }

    return res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('ForgotPassword error:', err.message);
    return res.status(500).json({ message: 'Request failed: ' + err.message });
  }
};

// POST /api/auth/verify-reset-otp
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const record = await OTP.findOne({ email: email.toLowerCase(), type: 'FORGOT_PASSWORD', isUsed: false });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP.' });
    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (record.attempts >= 5) {
      await OTP.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Too many wrong attempts. Request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, record.otp);
    if (!isValid) {
      await OTP.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: 'Invalid OTP. Try again.' });
    }

    await OTP.findByIdAndUpdate(record._id, { isUsed: true });
    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    return res.json({ success: true, message: 'OTP verified.', resetToken });
  } catch (err) {
    console.error('VerifyResetOTP error:', err.message);
    return res.status(500).json({ message: 'Verification failed: ' + err.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ message: 'Reset token and new password are required.' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Reset token expired or invalid. Start over.' });
    }

    if (decoded.purpose !== 'password-reset') return res.status(400).json({ message: 'Invalid reset token.' });

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password reset successfully! You can now login.' });
  } catch (err) {
    console.error('ResetPassword error:', err.message);
    return res.status(500).json({ message: 'Password reset failed: ' + err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

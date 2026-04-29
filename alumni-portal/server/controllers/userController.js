const User = require('../models/User');
const Profile = require('../models/Profile');
const { cloudinary } = require('../config/cloudinary');

// GET /api/users/profile  — get own full profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'name email role avatar');
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/profile  — update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const allowed = ['bio', 'skills', 'company', 'designation', 'experience', 'batch', 'department', 'location', 'linkedin', 'github', 'website', 'achievements', 'isAvailableForMentorship'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const profile = await Profile.findOneAndUpdate({ userId: req.user.id }, updates, { new: true, runValidators: true });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/avatar  — upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const avatarUrl = req.file.path;

    // Remove old avatar from Cloudinary if exists
    if (req.user.avatar) {
      const publicId = req.user.avatar.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`alumni-portal/avatars/${publicId}`).catch(() => {});
    }

    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/resume  — upload resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const resumeUrl = req.file.path;
    await Profile.findOneAndUpdate({ userId: req.user.id }, { resume: resumeUrl });
    res.json({ success: true, resume: resumeUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required.' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Min 8 characters for new password.' });

    const user = await User.findById(req.user.id).select('+password');
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

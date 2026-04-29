const Profile = require('../models/Profile');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// GET /api/profiles/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'name email avatar role');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/profiles/me
exports.updateMyProfile = async (req, res) => {
  try {
    const allowed = ['bio', 'skills', 'company', 'designation', 'experience', 'batch', 'department', 'location', 'linkedin', 'github', 'website', 'achievements', 'isAvailableForMentorship'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('userId', 'name email avatar role');

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/profiles/upload-avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
    const avatarUrl = req.file.path;
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/profiles/upload-resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded.' });
    const resumeUrl = req.file.path;
    await Profile.findOneAndUpdate({ userId: req.user.id }, { resume: resumeUrl });
    res.json({ success: true, resume: resumeUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/profiles/:userId
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId', 'name email avatar role');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/profiles/alumni/search
exports.searchAlumni = async (req, res) => {
  try {
    const { skills, company, batch, name, mentorship, page = 1, limit = 12 } = req.query;

    const profileFilter = {};
    if (skills) profileFilter.skills = { $in: skills.split(',').map((s) => s.trim()) };
    if (company) profileFilter.company = new RegExp(company, 'i');
    if (batch) profileFilter.batch = batch;
    if (mentorship === 'true') profileFilter.isAvailableForMentorship = true;

    const userFilter = { role: 'alumni', isApproved: true, isActive: true };
    if (name) userFilter.name = new RegExp(name, 'i');

    const alumni = await User.find(userFilter).select('_id');
    const alumniIds = alumni.map((u) => u._id);

    profileFilter.userId = { $in: alumniIds };

    const total = await Profile.countDocuments(profileFilter);
    const profiles = await Profile.find(profileFilter)
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, profiles, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

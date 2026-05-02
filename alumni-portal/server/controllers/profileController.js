const Profile = require('../models/Profile');
const User    = require('../models/User');

// ── GET my profile ────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id })
      .populate('userId', 'name email avatar role');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── UPDATE my profile ─────────────────────────────────────
exports.updateMyProfile = async (req, res) => {
  try {
    const allowed = [
      'bio','avatar','location','phone',
      // student
      'fullName','department','year','section','interests','skills',
      // alumni
      'passOutYear','currentCompany','roleInCompany','experience',
      'batch','company','designation','isAvailableForMentorship','achievements',
      // teacher
      'teacherDepartment','qualification','yearsOfExperience','subjectsTaught',
      // links
      'linkedin','github','website','resume',
    ];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('userId', 'name email avatar role');

    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── UPLOAD avatar ─────────────────────────────────────────
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
    const url = req.file.path;
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    await Profile.findOneAndUpdate({ userId: req.user.id }, { avatar: url }, { upsert: true });
    res.json({ success: true, avatar: url });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── UPLOAD resume ─────────────────────────────────────────
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded.' });
    await Profile.findOneAndUpdate({ userId: req.user.id }, { resume: req.file.path }, { upsert: true });
    res.json({ success: true, resume: req.file.path });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET profile by userId ─────────────────────────────────
// Access control: each role can view certain profiles
exports.getProfileById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId).select('role name email avatar isActive');
    if (!targetUser || !targetUser.isActive)
      return res.status(404).json({ message: 'User not found.' });

    const viewerRole = req.user.role;
    const targetRole = targetUser.role;

    // Access matrix
    const canView = {
      student:    ['alumni','teacher'],
      alumni:     ['student','teacher'],
      teacher:    ['student','alumni'],
      admin:      ['student','alumni','teacher','admin'],
      superadmin: ['student','alumni','teacher','admin','superadmin'],
    };

    if (!canView[viewerRole]?.includes(targetRole)) {
      return res.status(403).json({ message: 'You do not have permission to view this profile.' });
    }

    const profile = await Profile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email avatar role');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    res.json({ success: true, profile });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SEARCH alumni ─────────────────────────────────────────
exports.searchAlumni = async (req, res) => {
  try {
    const { skills, company, batch, passOutYear, name, mentorship, page = 1, limit = 12 } = req.query;

    const profileFilter = {};
    if (skills)      profileFilter.skills = { $in: skills.split(',').map(s => s.trim()) };
    if (company)     profileFilter.$or = [
      { currentCompany: new RegExp(company, 'i') },
      { company: new RegExp(company, 'i') }
    ];
    if (batch || passOutYear) {
      const yr = batch || passOutYear;
      profileFilter.$or = [...(profileFilter.$or||[]),
        { passOutYear: yr }, { batch: yr }
      ];
    }
    if (mentorship === 'true') profileFilter.isAvailableForMentorship = true;

    const userFilter = { role: 'alumni', isApproved: true, isActive: true };
    if (name) userFilter.name = new RegExp(name, 'i');

    const alumni = await User.find(userFilter).select('_id');
    profileFilter.userId = { $in: alumni.map(u => u._id) };

    const total = await Profile.countDocuments(profileFilter);
    const profiles = await Profile.find(profileFilter)
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, profiles, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SEARCH teachers ───────────────────────────────────────
exports.searchTeachers = async (req, res) => {
  try {
    const { department, name, page = 1, limit = 12 } = req.query;

    const profileFilter = {};
    if (department) profileFilter.teacherDepartment = new RegExp(department, 'i');

    const userFilter = { role: 'teacher', isActive: true };
    if (name) userFilter.name = new RegExp(name, 'i');

    const teachers = await User.find(userFilter).select('_id');
    profileFilter.userId = { $in: teachers.map(u => u._id) };

    const total = await Profile.countDocuments(profileFilter);
    const profiles = await Profile.find(profileFilter)
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, profiles, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SEARCH students ───────────────────────────────────────
exports.searchStudents = async (req, res) => {
  try {
    const { department, year, name, page = 1, limit = 12 } = req.query;

    const profileFilter = {};
    if (department) profileFilter.department = new RegExp(department, 'i');
    if (year)       profileFilter.year = year;

    const userFilter = { role: 'student', isActive: true };
    if (name) userFilter.name = new RegExp(name, 'i');

    const students = await User.find(userFilter).select('_id');
    profileFilter.userId = { $in: students.map(u => u._id) };

    const total = await Profile.countDocuments(profileFilter);
    const profiles = await Profile.find(profileFilter)
      .populate('userId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, profiles, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

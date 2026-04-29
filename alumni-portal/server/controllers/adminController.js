const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Event = require('../models/Event');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, pendingAlumni, totalJobs, totalEvents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'alumni', isApproved: false }),
      Job.countDocuments({ isActive: true }),
      Event.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt isApproved isEmailVerified')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, stats: { totalUsers, pendingAlumni, totalJobs, totalEvents, usersByRole, recentUsers } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/pending-alumni
exports.getPendingAlumni = async (req, res) => {
  try {
    const users = await User.find({ role: 'alumni', isApproved: false }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/approve
exports.approveAlumni = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, user, message: isApproved ? 'Alumni approved!' : 'Alumni rejected.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot modify superadmin.' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot delete superadmin.' });

    await User.findByIdAndDelete(req.params.id);
    await Profile.findOneAndDelete({ userId: req.params.id });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/create-admin  (superadmin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });

    const admin = await User.create({ name, email, password, role: 'admin', isEmailVerified: true, isApproved: true });
    await Profile.create({ userId: admin._id });
    res.status(201).json({ success: true, message: 'Admin created.', user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Job = require('../models/Job');

// GET /api/jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { skills, type, location, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (skills) filter.skills = { $in: skills.split(',').map((s) => s.trim()) };
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, jobs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name avatar email');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, skills, location, type, salary, deadline } = req.body;
    if (!title || !company || !description)
      return res.status(400).json({ message: 'Title, company and description are required.' });

    const job = await Job.create({
      title, company, description, requirements, skills, location, type, salary, deadline,
      postedBy: req.user.id,
    });
    const populated = await job.populate('postedBy', 'name avatar');
    res.status(201).json({ success: true, job: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.postedBy.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role))
      return res.status(403).json({ message: 'Not authorized to edit this job.' });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, job: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.postedBy.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role))
      return res.status(403).json({ message: 'Not authorized to delete this job.' });

    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/jobs/:id/apply
exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (!job.isActive) return res.status(400).json({ message: 'This job is no longer accepting applications.' });

    const already = job.applicants.find((a) => a.userId.toString() === req.user.id);
    if (already) return res.status(400).json({ message: 'You have already applied for this job.' });

    job.applicants.push({ userId: req.user.id, resume: req.body.resume, coverLetter: req.body.coverLetter });
    await job.save();
    res.json({ success: true, message: 'Applied successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/my-applications
exports.getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applicants.userId': req.user.id })
      .populate('postedBy', 'name avatar')
      .select('title company type location applicants createdAt');

    const applications = jobs.map((job) => {
      const app = job.applicants.find((a) => a.userId.toString() === req.user.id);
      return { job: { _id: job._id, title: job.title, company: job.company, type: job.type, location: job.location }, status: app.status, appliedAt: app.appliedAt };
    });

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

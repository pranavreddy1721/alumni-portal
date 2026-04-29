const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    requirements: [{ type: String }],
    skills: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      default: 'full-time',
    },
    salary: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resume: String,
        coverLetter: String,
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

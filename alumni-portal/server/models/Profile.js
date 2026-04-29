const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String, trim: true }],
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    experience: { type: Number, default: 0, min: 0, max: 50 },
    batch: { type: String },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    resume: { type: String },       // Cloudinary URL
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
    achievements: [{ type: String }],
    isAvailableForMentorship: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);

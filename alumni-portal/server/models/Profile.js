const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // ── Common fields ──────────────────────────────────────
    bio:        { type: String, maxlength: 600 },
    avatar:     { type: String },           // Cloudinary URL
    location:   { type: String, trim: true },
    phone:      { type: String, trim: true },

    // ── Student fields ─────────────────────────────────────
    fullName:   { type: String, trim: true },
    department: { type: String, trim: true },
    year:       { type: String, enum: ['1st','2nd','3rd','4th',''] },
    section:    { type: String, trim: true },
    interests:  [{ type: String, trim: true }],
    skills:     [{ type: String, trim: true }],

    // ── Alumni fields ──────────────────────────────────────
    passOutYear:    { type: String },           // graduation year
    currentCompany: { type: String, trim: true },
    roleInCompany:  { type: String, trim: true },
    experience:     { type: Number, default: 0, min: 0, max: 50 },
    batch:          { type: String },           // keep for backward compat
    company:        { type: String, trim: true },// keep for backward compat
    designation:    { type: String, trim: true },// keep for backward compat
    isAvailableForMentorship: { type: Boolean, default: false },
    achievements:   [{ type: String }],

    // ── Teacher fields ─────────────────────────────────────
    teacherDepartment:   { type: String, trim: true },
    qualification:       { type: String, trim: true },
    yearsOfExperience:   { type: Number, default: 0, min: 0 },
    subjectsTaught:      [{ type: String, trim: true }],

    // ── Links (all roles) ──────────────────────────────────
    linkedin: { type: String },
    github:   { type: String },
    website:  { type: String },
    resume:   { type: String },             // Cloudinary URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);

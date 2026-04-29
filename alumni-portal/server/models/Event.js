const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 2000 },
    date: { type: Date, required: true },
    time: { type: String },
    venue: { type: String },
    isOnline: { type: Boolean, default: false },
    meetLink: { type: String },
    banner: { type: String }, // Cloudinary URL
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxAttendees: { type: Number },
    category: {
      type: String,
      enum: ['workshop', 'seminar', 'alumni-meet', 'webinar', 'hackathon', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

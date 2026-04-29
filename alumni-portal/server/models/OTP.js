const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true }, // bcrypt hashed
    type: {
      type: String,
      enum: ['EMAIL_VERIFY', 'FORGOT_PASSWORD'],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  },
  { timestamps: true }
);

// Auto-delete expired documents (MongoDB TTL)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

module.exports = mongoose.model('OTP', otpSchema);

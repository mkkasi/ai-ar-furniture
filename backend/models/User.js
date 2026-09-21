const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      purpose: {
        type: String,
        enum: ['email_verification', 'password_reset'],
        select: false,
      },
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      pushNotifications: { type: Boolean, default: true },
    },
    fcmTokens: [{ type: String }],
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Instance method to return safe public profile
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

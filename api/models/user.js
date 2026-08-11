const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ['Admin', 'Instructor', 'Student'],
      required: true
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    mocktests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTestSeries'
      }
    ],
    attempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttemptDetails'
      }
    ],
    image: {
      type: String,
      required: false
    },
    token: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseProgress'
      }
    ],
    mobileNumber: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    fcmTokens: [
      {
        token: { type: String, required: true },
        platform: {
          type: String,
          enum: ['web', 'android', 'ios'],
          default: 'web',
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    notificationPrefs: {
      pushEnabled: { type: Boolean, default: true },
      testReminders: { type: Boolean, default: true },
      rankUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Login and signup both hit findOne({ email }) on every request.
userSchema.index({ email: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({ mocktests: 1 });

const User = mongoose.model('User', userSchema);



module.exports = User;
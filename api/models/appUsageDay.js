const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    type: { type: String, enum: ['login', 'open'], required: true },
    startedAt: { type: Date, required: true },
    lastHeartbeatAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: 0 },
    platform: { type: String, default: '' },
    appVersion: { type: String, default: '' },
  },
  { _id: false }
);

const appUsageDaySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    accountType: { type: String, default: 'Student' },
    loginCount: { type: Number, default: 0 },
    openCount: { type: Number, default: 0 },
    totalDurationMs: { type: Number, default: 0 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    sessions: { type: [sessionSchema], default: [] },
  },
  { timestamps: true }
);

appUsageDaySchema.index({ user: 1, dateKey: 1 }, { unique: true });
appUsageDaySchema.index({ dateKey: 1, accountType: 1 });

module.exports = mongoose.model('AppUsageDay', appUsageDaySchema);

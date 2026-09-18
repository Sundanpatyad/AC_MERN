const mongoose = require('mongoose');

const answerItemSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number },
    questionText: { type: String, default: '' },
    userAnswer: { type: String, default: 'Not answered' },
    correctAnswer: { type: String, default: '' },
    questionType: { type: String, default: 'MCQ' },
    questionImage: { type: String, default: '' },
    leftColumn: [{ type: String }],
    rightColumn: [{ type: String }],
    type: {
      type: String,
      enum: ['correct', 'incorrect', 'skipped'],
    },
  },
  { _id: false }
);

const attemptDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTestSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTestSeries',
      required: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: [answerItemSchema],
    incorrectAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    incorrectAnswerDetails: [answerItemSchema],
    skippedAnswers: {
      type: Number,
      default: 0,
    },
    skippedAnswerDetails: [answerItemSchema],
    timeTaken: {
      type: Number, // in seconds
      required: true,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    attemptDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attemptDetailsSchema.index({ mockTestSeries: 1, testName: 1, attemptDate: -1 });
attemptDetailsSchema.index({ user: 1, attemptDate: -1 });
attemptDetailsSchema.index({ user: 1, testName: 1, attemptDate: -1 });

module.exports = mongoose.model('AttemptDetails', attemptDetailsSchema);

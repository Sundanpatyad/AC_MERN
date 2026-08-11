const mongoose = require('mongoose');

const MockTestSeriesSchema = new mongoose.Schema({
  seriesName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  attachments: [
    {
      name: { type: String },
      questionPaper: { type: String },
      answerKey: { type: String },
      omrSheet: { type: String },
    }

  ],
  mockTests: [
    {
      testName: { type: String, required: true },
      questions: [
        {
          text: { type: String }, // Main question text (optional)
          questionImage: { type: String }, // Question image
          questionType: {
            type: String,
            enum: ['MCQ', 'MATCH', 'STATEMENT'],
            default: 'MCQ'
          }, // Question type

          // For Match the Following questions
          leftColumn: [{ type: String }], // Left side items (a, b, c, d)
          rightColumn: [{ type: String }], // Right side items (1, 2, 3, 4)

          // For all question types
          options: [mongoose.Schema.Types.Mixed], // Answer options (can be String or Object with text/image)
          correctAnswer: { type: String, required: true }, // Correct answer

          // Optional fields
          explanation: { type: String }, // Explanation for the answer
          marks: { type: Number, default: 1 }, // Marks for this question
        }
      ],
      duration: { type: Number, required: true },
      negative: { type: Number, default: 0 },
      price: { type: Number },
      status: { type: String, enum: ['published', 'draft'], default: 'published' },
      studentsEnrolled: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }
      ],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  totalTests: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String
  },
  price: {
    type: Number,

  },
  itemType: {
    type: String,
    default: 'mocktest'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft'
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

MockTestSeriesSchema.index({ studentsEnrolled: 1 });
MockTestSeriesSchema.index({ creator: 1 });
MockTestSeriesSchema.index({ status: 1 });

const MockTestSeries = mongoose.model('MockTestSeries', MockTestSeriesSchema);

module.exports = { MockTestSeries };

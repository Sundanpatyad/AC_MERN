const mongoose = require('mongoose');

const pdfExamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    thumbnail: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    access: { type: String, enum: ['free', 'paid'], default: 'free' },
    price: { type: Number, default: 0, min: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

pdfExamSchema.index({ category: 1, name: 1 });

module.exports = mongoose.model('PdfExam', pdfExamSchema);

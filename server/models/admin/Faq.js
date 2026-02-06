const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  aiConfidenceScore: {
    type: Number,
    default: 0.8, // Default confidence score for AI to use this FAQ
    min: 0,
    max: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  }
});

// Update the updatedAt field when the FAQ is modified
faqSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

// Index for efficient querying
faqSchema.index({ category: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ aiConfidenceScore: -1 });

module.exports = mongoose.model('Faq', faqSchema);
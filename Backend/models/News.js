const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters long']
  },
  game: {
    type: String,
    required: [true, 'Game is required'],
    trim: true,
    maxlength: [100, 'Game name cannot exceed 100 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update updatedAt
NewsSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for better search performance
NewsSchema.index({ title: 'text', content: 'text' });
NewsSchema.index({ game: 1 });
NewsSchema.index({ author: 1 });
NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ createdAt: -1 });

// Method to publish news
NewsSchema.methods.publish = function() {
  this.publishedAt = new Date();
  return this.save();
};

// Method to unpublish news
NewsSchema.methods.unpublish = function() {
  this.publishedAt = null;
  return this.save();
};

// Method to check if news is published
NewsSchema.methods.isPublished = function() {
  return this.publishedAt !== null && this.publishedAt <= new Date();
};

// Virtual for formatted published date
NewsSchema.virtual('publishedDateFormatted').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are included in JSON output
NewsSchema.set('toJSON', { virtuals: true });
NewsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('News', NewsSchema);

const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'documents', 'clothing', 'jewelry', 'bags', 'keys', 'books', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['lost', 'found', 'claimed'],
    default: 'lost',
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  locationDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Location description cannot exceed 300 characters'],
  },
  dateOccurred: {
    type: Date,
  },
  contactName: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  contactPhone: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
lostItemSchema.index({ status: 1, createdAt: -1 });
lostItemSchema.index({ category: 1 });

module.exports = mongoose.model('LostItem', lostItemSchema);


const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters'],
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // If imageUrl is provided, it should be a valid base64 data URI
        if (!v) return true; // Optional field
        return typeof v === 'string' && v.startsWith('data:image/');
      },
      message: 'Image URL must be a valid base64 data URI'
    }
  },
  category: {
    type: String,
    enum: ['safety_alert', 'awareness', 'rule_update', 'general'],
    default: 'general',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ category: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);


const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  location: {
    building: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'fire', 'security', 'natural_disaster', 'other'],
    default: 'other',
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  // Privacy: Only store verification status, not identity
  isVerifiedDevice: {
    type: Boolean,
    default: false,
  },
  campusTokenHash: {
    type: String,
    // Hash of verification token for abuse tracking, not identification
  },
  // Optional contact info (student chooses to provide)
  contactInfo: {
    provided: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  // Admin management
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'false_alarm'],
    default: 'active',
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  // Abuse prevention tracking
  deviceFingerprint: {
    type: String,
    // For rate limiting, not personal identification
  },
}, {
  timestamps: true,
});

// Index for efficient queries
emergencyAlertSchema.index({ status: 1, timestamp: -1 });
emergencyAlertSchema.index({ 'location.building': 1 });
emergencyAlertSchema.index({ campusTokenHash: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);



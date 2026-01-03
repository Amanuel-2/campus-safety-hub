const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
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
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  images: {
    type: [String],  // Array of base64 encoded image data strings
    default: [],
    validate: {
      validator: function(v) {
        // Ensure it's an array and each image is a string
        return Array.isArray(v) && v.every(img => typeof img === 'string');
      },
      message: 'Images must be an array of base64 strings'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['safety_concern', 'suspicious_activity', 'theft', 'vandalism', 'harassment', 'emergency', 'other'],
    default: 'safety_concern',
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved'],
    default: 'pending',
  },
  locationId: {
    type: String,
    trim: true,
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
  anonymous: {
    type: Boolean,
    default: true,
  },
  reporterName: {
    type: String,
    trim: true,
  },
  reporterContact: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ type: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ locationId: 1 });

module.exports = mongoose.model('Incident', incidentSchema);


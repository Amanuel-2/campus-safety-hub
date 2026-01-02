const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const studentSchema = new mongoose.Schema({
  campusId: {
    type: String,
    required: [true, 'Campus ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  verificationExpires: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  // Privacy: Store minimal data
  deviceFingerprint: {
    type: String,
    // Used for verification token association, not personal identification
  },
}, {
  timestamps: true,
});

// Hash password before saving
studentSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Generate verification token
studentSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Method to compare passwords
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate campus verification token (non-identifying)
studentSchema.methods.generateCampusToken = function() {
  // This token proves device belongs to verified campus user
  // Does NOT contain personal information
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('Student', studentSchema);



const mongoose = require('mongoose');

/**
 * Simulated Campus Student Database
 * In production, this would connect to the official university database
 * For this implementation, we'll use a simple lookup table
 */
const campusDatabaseSchema = new mongoose.Schema({
  campusId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  // Minimal verification data - just enough to verify student exists
  isValid: {
    type: Boolean,
    default: true,
  },
  // Optional: Store when this ID was last verified against official DB
  lastVerified: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Static method to verify campus ID
campusDatabaseSchema.statics.verifyCampusId = async function(campusId) {
  const normalizedId = campusId.toUpperCase().trim();
  
  // Check if ID exists in our database
  const record = await this.findOne({ campusId: normalizedId, isValid: true });
  
  if (record) {
    // Update last verified timestamp
    record.lastVerified = Date.now();
    await record.save();
    return true;
  }
  
  // In production, this would query the official university database
  // For now, we'll accept any ID that matches a pattern
  // In real implementation: return await queryOfficialDatabase(normalizedId);
  
  return false;
};

module.exports = mongoose.model('CampusDatabase', campusDatabaseSchema);



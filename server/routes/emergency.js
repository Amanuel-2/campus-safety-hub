const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const EmergencyAlert = require('../models/EmergencyAlert');
const { emergencyAlertLimiter } = require('../middleware/rateLimiter');
const { broadcastEmergencyAlert } = require('../services/socketService');
const { sendEmergencyEmail } = require('../services/emailService');

const CAMPUS_TOKEN_SECRET = process.env.CAMPUS_TOKEN_SECRET || 'campus_verification_secret_2026';

// Helper to hash campus token
const hashCampusToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token + CAMPUS_TOKEN_SECRET).digest('hex');
};

// Helper to generate device fingerprint
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  return crypto.createHash('sha256').update(userAgent + ip).digest('hex').substring(0, 16);
};

// POST emergency alert - FAIL OPEN (no authentication required)
router.post('/alert', emergencyAlertLimiter, async (req, res) => {
  try {
    const { 
      locationId,
      building, 
      area, 
      coordinates, 
      emergencyType, 
      description,
      contactInfo,
      campusToken // Optional - proves verified device
    } = req.body;
    
    // Location is required (either locationId or building)
    if (!locationId && !building) {
      return res.status(400).json({ 
        message: 'Location selection is required for emergency alerts. Please select a location on the campus map.' 
      });
    }
    
    // Create emergency alert
    const alert = new EmergencyAlert({
      timestamp: new Date(),
      location: {
        locationId: locationId ? locationId.trim() : undefined,
        building: building ? building.trim() : (locationId ? 'Selected Location' : undefined),
        area: area ? area.trim() : undefined,
        coordinates: coordinates || undefined,
      },
      emergencyType: emergencyType || 'other',
      description: description ? description.trim() : undefined,
      isVerifiedDevice: !!campusToken,
      campusTokenHash: campusToken ? hashCampusToken(campusToken) : null,
      deviceFingerprint: generateDeviceFingerprint(req),
      contactInfo: contactInfo ? {
        provided: true,
        phone: contactInfo.phone,
        email: contactInfo.email,
      } : { provided: false },
      status: 'active',
    });
    
    await alert.save();
    
    // Broadcast real-time notification to all connected admins
    try {
      broadcastEmergencyAlert(alert);
    } catch (error) {
      console.error('Failed to broadcast emergency alert:', error);
      // Don't fail the request if socket broadcast fails
    }
    
    // Send backup email notification (non-blocking)
    try {
      sendEmergencyEmail(alert);
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't fail the request if email fails
    }
    
    console.log(`🚨 EMERGENCY ALERT: ${alert._id} - ${building} - ${emergencyType}`);
    
    res.status(201).json({
      message: 'Emergency alert sent successfully',
      alertId: alert._id,
      timestamp: alert.timestamp,
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ 
      message: 'Error sending emergency alert', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET all emergency alerts (admin only - will add auth middleware)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const alerts = await EmergencyAlert.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('resolvedBy', 'username name')
      .lean();
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
});

// GET single emergency alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id)
      .populate('resolvedBy', 'username name')
      .lean();
    
    if (!alert) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert', error: error.message });
  }
});

// PATCH update emergency alert status (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'false_alarm') {
        updateData.resolvedAt = new Date();
        // In production, get admin ID from auth middleware
        // updateData.resolvedBy = req.admin.id;
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    
    // Broadcast status update to admins
    if (status) {
      try {
        const { broadcastEmergencyUpdate } = require('../services/socketService');
        broadcastEmergencyUpdate(alert._id, status);
      } catch (error) {
        console.error('Failed to broadcast status update:', error);
      }
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert', error: error.message });
  }
});

// GET active emergency alerts count (for admin dashboard)
router.get('/stats/active', async (req, res) => {
  try {
    const activeCount = await EmergencyAlert.countDocuments({ status: 'active' });
    const investigatingCount = await EmergencyAlert.countDocuments({ status: 'investigating' });
    
    res.json({
      active: activeCount,
      investigating: investigatingCount,
      totalActive: activeCount + investigatingCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;



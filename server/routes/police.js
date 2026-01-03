const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Police = require('../models/Police');
const EmergencyAlert = require('../models/EmergencyAlert');
const Incident = require('../models/Incident');
const { requirePolice } = require('../middleware/roleAuth');
const { broadcastEmergencyUpdate } = require('../services/socketService');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_safety_hub_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

// POST police login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const police = await Police.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });
    
    if (!police) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await police.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    police.lastLogin = Date.now();
    await police.save();
    
    // Generate JWT
    const token = jwt.sign(
      { id: police._id, username: police.username, role: 'police' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      police: {
        id: police._id,
        username: police.username,
        name: police.name,
        badgeNumber: police.badgeNumber,
      },
    });
  } catch (error) {
    console.error('Police login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET all emergency alerts
router.get('/emergencies', requirePolice, async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const alerts = await EmergencyAlert.find(filter)
      .populate('reportedBy.userId', 'name campusId role')
      .populate('acknowledgedBy', 'name badgeNumber')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergencies', error: error.message });
  }
});

// GET all incidents with reporter info
router.get('/incidents', requirePolice, async (req, res) => {
  try {
    const { status, type, severity, limit = 100 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    
    const incidents = await Incident.find(filter)
      .populate('reportedBy.userId', 'name campusId role phone department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

// PATCH update emergency status
router.patch('/emergencies/:id', requirePolice, async (req, res) => {
  try {
    const { status, acknowledge } = req.body;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved' || status === 'false_alarm') {
        updateData.resolvedAt = new Date();
      }
    }
    if (acknowledge) {
      updateData.acknowledgedBy = req.police.id;
      updateData.acknowledgedAt = new Date();
    }
    
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy.userId', 'name campusId role')
      .lean();
    
    if (!alert) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    
    // Broadcast status update
    if (status) {
      try {
        broadcastEmergencyUpdate(alert._id, status);
      } catch (error) {
        console.error('Failed to broadcast status update:', error);
      }
    }
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error updating emergency', error: error.message });
  }
});

// PATCH update incident status
router.patch('/incidents/:id', requirePolice, async (req, res) => {
  try {
    const { status, severity } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (severity) updateData.severity = severity;
    
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy.userId', 'name campusId role phone department')
      .lean();
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident', error: error.message });
  }
});

// POST add internal note to incident
router.post('/incidents/:id/notes', requirePolice, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    incident.internalNotes.push({
      content: content.trim(),
      addedBy: req.police.id,
      addedByModel: 'Police',
      addedAt: new Date(),
    });
    
    await incident.save();
    
    const updatedIncident = await Incident.findById(req.params.id)
      .populate('reportedBy.userId', 'name campusId role phone department')
      .populate('internalNotes.addedBy', 'name badgeNumber')
      .lean();
    
    res.json(updatedIncident);
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const User = require('../models/User');
const { requireUser, requirePolice, requireAdmin } = require('../middleware/roleAuth');

// GET all incidents (police/admin only)
router.get('/', requirePolice, async (req, res) => {
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

// GET user's own reports
router.get('/my-reports', requireUser, async (req, res) => {
  try {
    const incidents = await Incident.find({ 'reportedBy.userId': req.user.id })
      .select('-internalNotes') // Don't show internal notes to users
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your reports', error: error.message });
  }
});

// GET single incident by ID
router.get('/:id', requireUser, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy.userId', 'name campusId role')
      .lean();
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Users can only see their own incidents, police/admin can see all
    const isOwner = incident.reportedBy?.userId?.toString() === req.user.id;
    const isPolice = req.user.role === 'police';
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    
    if (!isOwner && !isPolice && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Don't show internal notes to regular users
    if (!isPolice && !isAdmin) {
      delete incident.internalNotes;
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incident', error: error.message });
  }
});

// POST create new incident (requires user authentication)
router.post('/', requireUser, async (req, res) => {
  try {
    const { title, description, type, severity, location, locationId, locationDescription, images } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure images is an array
    const imagesArray = Array.isArray(images) ? images : [];
    
    // Validate image count (max 5)
    if (imagesArray.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed' });
    }
    
    // Validate each image is a valid base64 string
    for (let i = 0; i < imagesArray.length; i++) {
      const img = imagesArray[i];
      if (typeof img !== 'string') {
        return res.status(400).json({ message: `Image ${i + 1} must be a base64 string` });
      }
      // Check if it's a valid base64 image (starts with data:image/)
      if (!img.startsWith('data:image/')) {
        return res.status(400).json({ message: `Image ${i + 1} must be a valid base64 image` });
      }
      // Check size (base64 is ~33% larger, so 5MB image = ~6.67MB base64)
      // MongoDB document limit is 16MB, so we'll limit each image to ~3MB base64 (~2.25MB original)
      if (img.length > 4000000) { // ~3MB base64
        return res.status(400).json({ message: `Image ${i + 1} is too large. Maximum size is 3MB per image.` });
      }
    }
    
    // Create incident data object with reporter identity
    const incidentData = {
      title: title.trim(),
      description: description.trim(),
      type: type || 'safety_concern',
      severity: severity || 'medium',
      images: imagesArray,
      location: location || null,
      locationId: locationId || null,
      locationDescription: locationDescription ? locationDescription.trim() : '',
      reportedBy: {
        userId: user._id,
        name: user.name,
        universityId: user.universityId || user.campusId,
        role: user.role,
      },
    };
    
    const incident = new Incident(incidentData);
    await incident.save();
    
    res.status(201).json({
      message: 'Incident created successfully',
      incident: {
        id: incident._id,
        title: incident.title,
        type: incident.type,
        severity: incident.severity,
        imagesCount: incident.images.length,
      }
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Check for MongoDB document size limit
    if (error.message && error.message.includes('document is too large')) {
      return res.status(400).json({ 
        message: 'Images are too large. Please reduce image size or upload fewer images.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating incident', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PATCH update incident (police/admin only)
router.patch('/:id', requirePolice, async (req, res) => {
  try {
    const { status, severity } = req.body;
    const updateData = {};
    
    if (status) updateData.status = status;
    if (severity) updateData.severity = severity;
    
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident', error: error.message });
  }
});

// DELETE incident (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting incident', error: error.message });
  }
});

module.exports = router;


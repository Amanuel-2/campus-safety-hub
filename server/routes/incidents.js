const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const authMiddleware = require('../middleware/auth');

// GET all incidents
router.get('/', async (req, res) => {
  try {
    const { status, type, severity, limit = 100 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    
    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

// GET single incident by ID
router.get('/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incident', error: error.message });
  }
});

// POST create new incident
router.post('/', async (req, res) => {
  try {
    const { title, description, type, severity, location, locationDescription, anonymous, reporterName, reporterContact, images } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
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
    
    // Create incident data object
    const incidentData = {
      title: title.trim(),
      description: description.trim(),
      type: type || 'safety_concern',
      severity: severity || 'medium',
      images: imagesArray,
      location: location || null,
      locationDescription: locationDescription ? locationDescription.trim() : '',
      anonymous: anonymous !== undefined ? anonymous : true,
      reporterName: anonymous ? '' : (reporterName ? reporterName.trim() : ''),
      reporterContact: anonymous ? '' : (reporterContact ? reporterContact.trim() : ''),
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

// PATCH update incident (admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
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
router.delete('/:id', authMiddleware, async (req, res) => {
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


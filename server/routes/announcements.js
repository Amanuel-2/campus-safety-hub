const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET all announcements (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
});

// GET single announcement by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name username');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement', error: error.message });
  }
});


module.exports = router;


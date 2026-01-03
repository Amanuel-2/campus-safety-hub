const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/auth');

// POST create new announcement (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, imageUrl, category } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Validate imageUrl if provided
    if (imageUrl && !imageUrl.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Image URL must be a valid base64 data URI' });
    }
    
    // Check image size (base64 is ~33% larger, limit to ~3MB base64)
    if (imageUrl && imageUrl.length > 4000000) {
      return res.status(400).json({ message: 'Image is too large. Maximum size is 3MB.' });
    }
    
    const announcement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      category: category || 'general',
      createdBy: req.admin.id,
    });
    
    await announcement.save();
    
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name username');
    
    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Error creating announcement', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT update announcement (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, imageUrl, category } = req.body;
    
    const updateData = {};
    
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updateData.title = title.trim();
    }
    
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ message: 'Content cannot be empty' });
      }
      updateData.content = content.trim();
    }
    
    if (imageUrl !== undefined) {
      if (imageUrl && !imageUrl.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Image URL must be a valid base64 data URI' });
      }
      if (imageUrl && imageUrl.length > 4000000) {
        return res.status(400).json({ message: 'Image is too large. Maximum size is 3MB.' });
      }
      updateData.imageUrl = imageUrl || null;
    }
    
    if (category !== undefined) {
      updateData.category = category;
    }
    
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name username');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Error updating announcement', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE announcement (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});

module.exports = router;


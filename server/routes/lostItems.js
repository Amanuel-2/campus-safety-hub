const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const authMiddleware = require('../middleware/auth');

// GET all lost items
router.get('/', async (req, res) => {
  try {
    const { status, category, limit = 100 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const items = await LostItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

// GET single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
});

// POST create new lost item
router.post('/', async (req, res) => {
  try {
    const item = new LostItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating item', error: error.message });
  }
});

// PATCH update item (admin only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = {};
    
    if (status) updateData.status = status;
    
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
});

// DELETE item (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Police = require('../models/Police');
const { requireAdmin } = require('../middleware/roleAuth');

// ========== USER MANAGEMENT ==========

// GET all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { role, search, limit = 100 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { campusId: { $regex: search, $options: 'i' } },
        { universityId: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(filter)
      .select('-password -verificationToken -deviceFingerprint')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST create user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { campusId, password, name, email, universityId, role, phone, department } = req.body;
    
    if (!campusId || !password || !name || !email) {
      return res.status(400).json({ message: 'Campus ID, email, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    
    const normalizedCampusId = campusId.toUpperCase().trim();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists by campus ID
    const existingUserByCampusId = await User.findOne({ campusId: normalizedCampusId });
    if (existingUserByCampusId) {
      return res.status(400).json({ message: 'User with this Campus ID already exists' });
    }
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({
      campusId: normalizedCampusId,
      email: normalizedEmail,
      password,
      name: name.trim(),
      universityId: universityId ? universityId.trim() : normalizedCampusId,
      role: role || 'student',
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      isVerified: true,
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.deviceFingerprint;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      // Check which field caused the duplicate key error
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      if (error.keyPattern?.campusId) {
        return res.status(400).json({ message: 'User with this Campus ID already exists' });
      }
      return res.status(400).json({ message: 'A user with this information already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// PUT edit user
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, universityId, role, phone, department, isVerified } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (universityId !== undefined) updateData.universityId = universityId.trim();
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : undefined;
    if (department !== undefined) updateData.department = department ? department.trim() : undefined;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -deviceFingerprint');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE deactivate user (soft delete by setting isVerified to false)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    ).select('-password -verificationToken -deviceFingerprint');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User deactivated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
});

// ========== POLICE MANAGEMENT ==========

// GET all police accounts
router.get('/police', requireAdmin, async (req, res) => {
  try {
    const { isActive, search, limit = 100 } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { badgeNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    const police = await Police.find(filter)
      .select('-password')
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(police);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching police accounts', error: error.message });
  }
});

// POST create police account
router.post('/police', requireAdmin, async (req, res) => {
  try {
    const { username, password, name, badgeNumber } = req.body;
    
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if police account already exists
    const existingPolice = await Police.findOne({ username: username.toLowerCase() });
    if (existingPolice) {
      return res.status(400).json({ message: 'Police account with this username already exists' });
    }
    
    const police = new Police({
      username: username.toLowerCase(),
      password,
      name: name.trim(),
      badgeNumber: badgeNumber ? badgeNumber.trim() : undefined,
      createdBy: req.admin.id,
      isActive: true,
    });
    
    await police.save();
    
    const policeResponse = police.toObject();
    delete policeResponse.password;
    
    res.status(201).json({
      message: 'Police account created successfully',
      police: policeResponse,
    });
  } catch (error) {
    console.error('Error creating police account:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Police account with this username already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating police account', error: error.message });
  }
});

// PUT edit police account
router.put('/police/:id', requireAdmin, async (req, res) => {
  try {
    const { name, badgeNumber, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (badgeNumber !== undefined) updateData.badgeNumber = badgeNumber ? badgeNumber.trim() : undefined;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const police = await Police.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!police) {
      return res.status(404).json({ message: 'Police account not found' });
    }
    
    res.json({
      message: 'Police account updated successfully',
      police,
    });
  } catch (error) {
    console.error('Error updating police account:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error updating police account', error: error.message });
  }
});

// DELETE deactivate police account
router.delete('/police/:id', requireAdmin, async (req, res) => {
  try {
    const police = await Police.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!police) {
      return res.status(404).json({ message: 'Police account not found' });
    }
    
    res.json({
      message: 'Police account deactivated successfully',
      police,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating police account', error: error.message });
  }
});

module.exports = router;


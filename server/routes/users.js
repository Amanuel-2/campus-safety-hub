const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const CampusDatabase = require('../models/CampusDatabase');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_safety_hub_secret_key_2026';
const CAMPUS_TOKEN_SECRET = process.env.CAMPUS_TOKEN_SECRET || 'campus_verification_secret_2026';
const JWT_EXPIRES_IN = '30d'; // Long-lived for convenience
const CAMPUS_TOKEN_EXPIRES_IN = '365d'; // Year-long verification token

// Helper to hash campus token for abuse tracking
const hashCampusToken = (token) => {
  return crypto.createHash('sha256').update(token + CAMPUS_TOKEN_SECRET).digest('hex');
};

// Helper to generate device fingerprint
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  return crypto.createHash('sha256').update(userAgent + ip).digest('hex').substring(0, 16);
};

// POST register - User registration with campus ID verification
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const { campusId, password, name, role, phone, department } = req.body;
    
    if (!campusId || !password || !name) {
      return res.status(400).json({ message: 'Campus ID, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Normalize campus ID
    const normalizedCampusId = campusId.toUpperCase().trim();
    
    // Verify campus ID against official database
    const isValid = await CampusDatabase.verifyCampusId(normalizedCampusId);
    
    if (!isValid) {
      return res.status(403).json({ 
        message: 'Invalid campus ID. Please verify your campus ID number.',
        code: 'INVALID_CAMPUS_ID'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ campusId: normalizedCampusId });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'This campus ID is already registered. Please log in instead.',
        code: 'ALREADY_REGISTERED'
      });
    }
    
    // Create new user
    const user = new User({
      campusId: normalizedCampusId,
      password,
      name: name.trim(),
      universityId: normalizedCampusId,
      role: role || 'student',
      phone: phone ? phone.trim() : undefined,
      department: department ? department.trim() : undefined,
      isVerified: true, // Verified via campus ID check
      deviceFingerprint: generateDeviceFingerprint(req),
    });
    
    await user.save();
    
    // Generate tokens
    const campusToken = user.generateCampusToken();
    const token = jwt.sign(
      { 
        id: user._id, 
        campusId: user.campusId,
        verified: user.isVerified 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      campusToken,
      user: {
        id: user._id,
        campusId: user.campusId,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This campus ID is already registered' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ 
      message: 'Error during registration', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST login - User login (supports both email and campusId)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, campusId } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    if (!email && !campusId) {
      return res.status(400).json({ message: 'Email or Campus ID is required' });
    }
    
    // Find user by email (preferred) or campusId (backward compatibility)
    let user;
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail });
    } else if (campusId) {
      const normalizedCampusId = campusId.toUpperCase().trim();
      user = await User.findOne({ campusId: normalizedCampusId });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    user.deviceFingerprint = generateDeviceFingerprint(req);
    await user.save();
    
    // Generate tokens
    const campusToken = user.generateCampusToken();
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id,
        campusId: user.campusId,
        email: user.email,
        role: user.role,
        verified: user.isVerified 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      campusToken,
      userInfo: {
        id: user._id,
        userId: user._id,
        campusId: user.campusId,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      user: {
        id: user._id,
        campusId: user.campusId,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET verify campus token
router.get('/verify-token', async (req, res) => {
  try {
    const campusToken = req.headers['x-campus-token'];
    
    if (!campusToken) {
      return res.status(401).json({ verified: false, message: 'No campus token provided' });
    }
    
    // In a real implementation, you'd verify the token signature
    // For now, we'll just check if it's a valid format
    if (campusToken.length === 64) { // 32 bytes hex = 64 chars
      return res.json({ verified: true });
    }
    
    return res.status(401).json({ verified: false, message: 'Invalid campus token' });
  } catch (error) {
    res.status(500).json({ verified: false, message: 'Error verifying token' });
  }
});

module.exports = router;


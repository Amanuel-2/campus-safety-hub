const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_safety_hub_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

// POST login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check MongoDB connection
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      console.error(`MongoDB connection state: ${states[readyState]} (${readyState})`);
      return res.status(503).json({ 
        message: 'Database connection error',
        details: 'MongoDB is not connected. Please ensure MongoDB is running and restart the server.',
        error: `Connection state: ${states[readyState]}`,
        solution: 'Start MongoDB: sudo systemctl start mongodb (Linux) or brew services start mongodb-community (macOS)'
      });
    }
    
    // Find admin by username
    let admin;
    try {
      admin = await Admin.findOne({ username: username.toLowerCase() });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      if (dbError.name === 'MongoServerError' || dbError.message.includes('ECONNREFUSED')) {
        return res.status(503).json({
          message: 'Database connection error',
          details: 'Cannot connect to MongoDB. Please ensure MongoDB is running.',
          error: dbError.message
        });
      }
      throw dbError;
    }
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST register (for initial setup - should be disabled in production)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new admin
    const admin = new Admin({
      username: username.toLowerCase(),
      password,
      name,
    });
    
    await admin.save();
    
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

module.exports = router;


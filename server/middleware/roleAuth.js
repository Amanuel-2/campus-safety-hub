const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'campus_safety_hub_secret_key_2026';

// Extract token from request
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

// Verify token and attach decoded data to request
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Require user authentication (student or staff)
const requireUser = (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Check if token has user fields (id and campusId)
  if (!decoded.id || !decoded.campusId) {
    return res.status(401).json({ message: 'Invalid user token' });
  }
  
  req.user = decoded;
  next();
};

// Require police authentication
const requirePolice = (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Check if token has police role
  if (decoded.role !== 'police') {
    return res.status(403).json({ message: 'Police access required' });
  }
  
  req.police = decoded;
  next();
};

// Require admin authentication
const requireAdmin = (req, res, next) => {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Check if token has admin role
  if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  req.admin = decoded;
  next();
};

module.exports = {
  requireUser,
  requirePolice,
  requireAdmin,
};


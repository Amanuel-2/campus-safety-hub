const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Registration rate limiter - prevent spam registrations
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: {
    message: 'Too many registration attempts. Please try again after 15 minutes.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use device fingerprint if available, otherwise use IP
    return req.headers['x-device-fingerprint'] || ipKeyGenerator(req);
  },
});

// Login rate limiter - prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use device fingerprint if available, otherwise use IP
    return req.headers['x-device-fingerprint'] || ipKeyGenerator(req);
  },
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

// Emergency alert rate limiter - prevent abuse
const emergencyAlertLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit to 3 emergency alerts per minute
  message: {
    message: 'Too many emergency alerts. Please wait before sending another.',
    retryAfter: 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use device fingerprint if available, otherwise use IP
    return req.headers['x-device-fingerprint'] || ipKeyGenerator(req);
  },
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests. Please try again later.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use device fingerprint if available, otherwise use IP
    return req.headers['x-device-fingerprint'] || ipKeyGenerator(req);
  },
});

module.exports = {
  registrationLimiter,
  loginLimiter,
  emergencyAlertLimiter,
  apiLimiter,
};

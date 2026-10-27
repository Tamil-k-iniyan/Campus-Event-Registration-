const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campus_event_jwt_super_secret_key_change_in_production_2026'
      );
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.'
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please provide a valid Bearer token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

// Optional auth: parses token if present, but does not block if absent
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campus_event_jwt_super_secret_key_change_in_production_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore token parse error for optional auth
    }
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };

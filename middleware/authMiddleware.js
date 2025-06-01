// middleware/authMiddleware.js
require('dotenv').config();
const jwt          = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User         = require('../models/userModel');

// Protect — verifies JWT and loads req.user
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Fetch user (without password)
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  req.user = user;
  next();
});

// RestrictTo — only allow users whose role is one of the allowedRoles
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

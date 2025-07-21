// backend/src/utils/tokenService.js
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId,role) => {
  return jwt.sign(
    { userId ,role},
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};
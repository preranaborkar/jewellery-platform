// ===== 6. CREATE: backend/src/middleware/auth.js =====
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} is not authorized for this action`);
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
const protect = (req, res, next) => {
  // example: assume you check JWT token and attach user to req.user
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // decode and attach user (just a mock example)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

   

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};


// Optional auth - for routes that work with or without auth
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                
                if (user && user.isVerified) {
                    req.user = user;
                }
            } catch (error) {
                // Token invalid, continue without user
                req.user = null;
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        req.user = null;
        next();
    }
};

module.exports = { authenticateToken , authorize , protect, optionalAuth };
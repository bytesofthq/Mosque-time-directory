const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyformosquedirectoryapplication123!');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated. Please contact root admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const authorizeRootAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ROOT_ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Root Admin privileges required' });
  }
};

const authorizeMosqueAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'MOSQUE_ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Mosque Admin privileges required' });
  }
};

module.exports = {
  authenticateUser,
  authorizeRootAdmin,
  authorizeMosqueAdmin
};

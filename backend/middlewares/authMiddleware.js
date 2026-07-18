const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Mosque = require('../models/Mosque');

const authenticateUser = async (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token in Authorization header for APIs / testing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
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
      return res.status(403).json({ message: 'Account is deactivated. Please contact root admin.' });
    }

    req.user = user;

    // Automatically renew the session while the user is active (sliding expiration)
    const keepMeSignedIn = decoded.keepMeSignedIn !== false;
    const expiryDays = process.env.SESSION_EXPIRY_DAYS ? parseInt(process.env.SESSION_EXPIRY_DAYS) : 30;
    const maxAge = keepMeSignedIn ? expiryDays * 24 * 60 * 60 * 1000 : undefined;
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: maxAge
    });

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
    return res.status(403).json({ message: 'Access denied: Sole Root Admin privileges required' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ROOT_ADMIN' || req.user.role === 'ADMIN')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

const authorizeMosqueAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'MOSQUE_ADMIN' || req.user.role === 'ADMIN' || req.user.role === 'ROOT_ADMIN')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Mosque Admin privileges required' });
  }
};

module.exports = {
  authenticateUser,
  authorizeRootAdmin,
  authorizeAdmin,
  authorizeMosqueAdmin
};



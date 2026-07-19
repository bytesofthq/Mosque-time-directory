const User = require('../models/User');
const Mosque = require('../models/Mosque');
const PrayerTiming = require('../models/PrayerTiming');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateLastLoginData } = require('../utils/userAgentParser');

// @desc    Auth user & set secure cookies
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { username, password, keepMeSignedIn } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username/email and password' });
  }

  try {
    const identifier = String(username).toLowerCase().trim();
    let query = {};
    if (identifier.includes('@')) {
      query = { email: identifier };
    } else {
      query = { username: identifier };
    }
    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact root admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Safely update lastLogin tracking metadata without triggering full document schema validation errors
    let lastLoginData = user.lastLogin;
    try {
      lastLoginData = generateLastLoginData(req);
      await User.updateOne({ _id: user._id }, { $set: { lastLogin: lastLoginData } });
    } catch (lastLoginError) {
      console.warn('Non-fatal error updating lastLogin metadata:', lastLoginError.message);
    }

    // Sign the JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        keepMeSignedIn: keepMeSignedIn !== false 
      },
      process.env.JWT_SECRET || 'supersecretkeyformosquedirectoryapplication123!',
      { expiresIn: '30d' }
    );

    // Cookie configuration
    const expiryDays = process.env.SESSION_EXPIRY_DAYS ? parseInt(process.env.SESSION_EXPIRY_DAYS) : 30;
    const maxAge = (keepMeSignedIn !== false) ? expiryDays * 24 * 60 * 60 * 1000 : undefined;
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: maxAge
    });

    // Generate and set CSRF cookie
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: maxAge
    });

    return res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email || undefined,
      role: user.role,
      mosqueId: user.mosqueId,
      lastLogin: lastLoginData,
      token: token,
      csrfToken: csrfToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login: ' + (error.message || 'Internal error') });
  }
};

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.clearCookie('csrfToken', {
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  return res.json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      // If Mosque Admin, check Mosque details
      const mosque = await Mosque.findById(req.user.mosqueId).select('-password');
      if (mosque) {
        return res.json({
          _id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          role: req.user.role,
          mosqueId: req.user.mosqueId
        });
      }
      return res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, username } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username.toLowerCase().trim() !== user.username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase().trim() });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already in use' });
      }
      user.username = username.toLowerCase().trim();

      // If user is a Mosque Admin, sync username with Mosque document
      if (user.role === 'MOSQUE_ADMIN' && user.mosqueId) {
        await Mosque.findByIdAndUpdate(user.mosqueId, { username: user.username });
      }
    }

    user.name = name || user.name;
    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      role: updatedUser.role,
      mosqueId: updatedUser.mosqueId
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error changing password' });
  }
};

// @desc    Register a new Mosque Admin and their Mosque
// @route   POST /api/auth/register-mosque
// @access  Public
const registerAdminWithMosque = async (req, res) => {
  const {
    name,
    username,
    password,
    mosqueName,
    address,
    area,
    city,
    state,
    pincode,
    googleMapLink,
    latitude,
    longitude,
    aboutMasjid
  } = req.body;

  if (!name || !username || !password || !mosqueName || !area || !city) {
    return res.status(400).json({ message: 'Name, Username, Password, Mosque Name, Area, and City are required' });
  }

  try {
    const usernameExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (usernameExists) {
      return res.status(400).json({ message: 'An account with this username already exists' });
    }

    const mongoose = require('mongoose');
    const adminId = new mongoose.Types.ObjectId();

    const mosque = new Mosque({
      mosqueName,
      username: username.toLowerCase().trim(),
      address: address || '',
      area,
      city,
      state: state || '',
      pincode: pincode || '',
      googleMapLink: googleMapLink || '',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      aboutMasjid: aboutMasjid || '',
      createdBy: adminId
    });

    const savedMosque = await mosque.save();

    const defaultTimings = new PrayerTiming({
      mosqueId: savedMosque._id,
      Fajr: { azan: '05:00', jamaat: '05:30' },
      Zuhr: { azan: '12:30', jamaat: '01:00' },
      Asr: { azan: '04:30', jamaat: '05:00' },
      Maghrib: { azan: '06:45', jamaat: '06:50' },
      Isha: { azan: '08:15', jamaat: '08:30' },
      Jumma: { azan: '01:00', khutbah: '01:30' }
    });
    await defaultTimings.save();

    const admin = new User({
      _id: adminId,
      name,
      username: username.toLowerCase().trim(),
      password,
      role: 'MOSQUE_ADMIN',
      mosqueId: savedMosque._id,
      isActive: true
    });
    await admin.save();

    return res.status(201).json({
      message: 'Registration successful! You can now log in using your credentials.'
    });
  } catch (error) {
    console.error('Public mosque registration error:', error);
    return res.status(500).json({ message: 'Server error registering mosque and admin' });
  }
};

// @desc    Register a new user (unassigned Mosque Admin)
// @route   POST /api/auth/register-user
// @access  Public
const registerUser = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, Username, and Password are required' });
  }

  try {
    const usernameExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (usernameExists) {
      return res.status(400).json({ message: 'An account with this username already exists' });
    }

    const user = new User({
      name,
      username: username.toLowerCase().trim(),
      password,
      role: 'MOSQUE_ADMIN',
      mosqueId: null,
      isActive: true
    });

    await user.save();

    return res.status(201).json({
      message: 'Registration successful! You can now log in.'
    });
  } catch (error) {
    console.error('User registration error:', error);
    return res.status(500).json({ message: 'Server error registering user' });
  }
};

// @desc    Suggest a short username from Mosque Name
// @route   GET /api/auth/suggest-username
// @access  Public
const getSuggestedUsername = async (req, res) => {
  const { mosqueName } = req.query;
  if (!mosqueName) {
    return res.status(400).json({ message: 'Mosque name is required' });
  }

  try {
    let cleaned = mosqueName.toLowerCase();

    // Direct exact matches first
    const normalized = cleaned.replace(/[^a-z0-9]/g, '');
    if (normalized === 'jamamasjid' || normalized === 'jamamasjidchowk') {
      return res.json({ username: normalized });
    }

    // Remove unnecessary words
    const wordsToRemove = ['masjid', 'mosque', 'jami', 'jamia', 'markaz', 'center'];
    let words = cleaned.split(/\s+/).filter(w => w.length > 0);
    words = words.filter(word => !wordsToRemove.includes(word.replace(/[^a-z0-9]/g, '')));

    let base = words.join('').replace(/[^a-z0-9]/g, '');

    // Apply preferred conversions
    if (base === 'alnoor' || base === 'noor' || normalized.includes('alnoor')) {
      base = 'alnoor';
    } else if (base === 'bilal' || normalized.includes('bilal')) {
      base = 'bilal';
    } else if (base === 'madina' || base === 'madinah' || normalized.includes('madina') || normalized.includes('madinah')) {
      base = 'madina';
    } else if (base === 'noorani' || normalized.includes('noorani')) {
      base = 'noorani';
    } else if (base === 'jama' || base === 'jamamasjid') {
      base = 'jamamasjid';
    }

    if (!base) {
      base = 'mosque';
    }

    if (base.length > 15) {
      base = base.substring(0, 15);
    }

    // Check unique list
    let suggested = base;
    let count = 1;
    let userExists = await User.findOne({ username: suggested });
    while (userExists) {
      count++;
      suggested = `${base}${count}`;
      userExists = await User.findOne({ username: suggested });
    }

    return res.json({ username: suggested });
  } catch (error) {
    console.error('Error suggesting username:', error);
    return res.status(500).json({ message: 'Server error generating username suggestion' });
  }
};

// @desc    Validate if a username is unique
// @route   GET /api/auth/validate-username
// @access  Public
const validateUsername = async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const userExists = await User.findOne({ username: username.toLowerCase().trim() });
    return res.json({ available: !userExists });
  } catch (error) {
    console.error('Error validating username:', error);
    return res.status(500).json({ message: 'Server error validating username' });
  }
};

module.exports = {
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  registerAdminWithMosque,
  registerUser,
  getSuggestedUsername,
  validateUsername
};

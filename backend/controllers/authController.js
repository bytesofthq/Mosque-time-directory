const User = require('../models/User');
const Mosque = require('../models/Mosque');
const PrayerTiming = require('../models/PrayerTiming');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailHelper');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, mobile, identifier, password } = req.body;
  const loginInput = identifier || email || mobile;

  if (!loginInput || !password) {
    return res.status(400).json({ message: 'Please provide email or mobile number, and password' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: loginInput.toLowerCase() },
        { mobile: loginInput.trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/mobile number or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact root admin.' });
    }

    // Only enforce email verification check if email exists on account and user has not verified it.
    if (user.email && !user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in. Check your inbox for the verification link.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/mobile number or password' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role,
      mosqueId: user.mosqueId,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
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
      return res.status(404).json({ message: 'User not found' });
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
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const email = req.body.email;
      const mobile = req.body.mobile;

      // Uniqueness check for email
      if (email !== undefined) {
        if (email === '') {
          user.email = undefined;
        } else if (email.toLowerCase() !== user.email) {
          const emailExists = await User.findOne({ email: email.toLowerCase() });
          if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Email is already in use by another user' });
          }
          user.email = email.toLowerCase();
        }
      }

      // Uniqueness check for mobile
      if (mobile !== undefined) {
        if (mobile === '') {
          user.mobile = undefined;
        } else if (mobile.trim() !== user.mobile) {
          const mobileExists = await User.findOne({ mobile: mobile.trim() });
          if (mobileExists && mobileExists._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Mobile number is already in use by another user' });
          }
          user.mobile = mobile.trim();
        }
      }

      if (!user.email && !user.mobile) {
        return res.status(400).json({ message: 'At least one of Email or Mobile number must be configured' });
      }

      user.name = req.body.name || user.name;

      const updatedUser = await user.save();

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email || '',
        mobile: updatedUser.mobile || '',
        role: updatedUser.role,
        mosqueId: updatedUser.mosqueId
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
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
    email,
    mobile,
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

  if (!name || (!email && !mobile) || !password) {
    return res.status(400).json({ message: 'Name, password, and at least one of Email or Mobile number are required' });
  }

  if (!mosqueName || !address || !area || !city || !state || !pincode || !googleMapLink) {
    return res.status(400).json({ message: 'All basic mosque fields are required' });
  }

  try {
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
    }

    if (mobile) {
      const mobileExists = await User.findOne({ mobile: mobile.trim() });
      if (mobileExists) {
        return res.status(400).json({ message: 'An account with this mobile number already exists' });
      }
    }

    const mongoose = require('mongoose');
    const adminId = new mongoose.Types.ObjectId();

    const mosque = new Mosque({
      mosqueName,
      address,
      area,
      city,
      state,
      pincode,
      googleMapLink,
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

    const verificationToken = email ? crypto.randomBytes(32).toString('hex') : null;
    const verificationTokenExpires = email ? Date.now() + 24 * 60 * 60 * 1000 : null;

    const admin = new User({
      _id: adminId,
      name,
      email: email ? email.toLowerCase() : undefined,
      mobile: mobile ? mobile.trim() : undefined,
      password,
      role: 'MOSQUE_ADMIN',
      mosqueId: savedMosque._id,
      isActive: true,
      isEmailVerified: email ? false : true,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires
    });
    const savedAdmin = await admin.save();

    // Send verification email via Brevo if email is provided
    if (email) {
      try {
        await sendVerificationEmail(savedAdmin.email, savedAdmin.name, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
    }

    const successMessage = email
      ? 'Registration successful! Please check your email to verify your account before logging in.'
      : 'Registration successful! You can now log in using your mobile number.';

    return res.status(201).json({
      message: successMessage
    });
  } catch (error) {
    console.error('Public mosque registration error:', error);
    return res.status(500).json({ message: 'Server error registering mosque and admin' });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired email verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({
      message: 'Your email has been verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Server error during email verification.' });
  }
};

// @desc    Register a new user (Imam/Muazzin) without a mosque
// @route   POST /api/auth/register-user
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || (!email && !mobile) || !password) {
    return res.status(400).json({ message: 'Name, password, and at least one of Email or Mobile number are required' });
  }

  try {
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
    }

    if (mobile) {
      const mobileExists = await User.findOne({ mobile: mobile.trim() });
      if (mobileExists) {
        return res.status(400).json({ message: 'An account with this mobile number already exists' });
      }
    }

    const verificationToken = email ? crypto.randomBytes(32).toString('hex') : null;
    const verificationTokenExpires = email ? Date.now() + 24 * 60 * 60 * 1000 : null;

    const user = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      mobile: mobile ? mobile.trim() : undefined,
      password,
      role: 'MOSQUE_ADMIN',
      mosqueId: null,
      isActive: true,
      isEmailVerified: email ? false : true,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires
    });

    const savedUser = await user.save();

    // Send verification email if email is provided
    if (email) {
      try {
        await sendVerificationEmail(savedUser.email, savedUser.name, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
    }

    const successMessage = email
      ? 'Registration successful! Please check your email to verify your account before logging in.'
      : 'Registration successful! You can now log in using your mobile number.';

    return res.status(201).json({
      message: successMessage
    });
  } catch (error) {
    console.error('User registration error:', error);
    return res.status(500).json({ message: 'Server error registering user' });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  registerAdminWithMosque,
  verifyEmail,
  registerUser
};

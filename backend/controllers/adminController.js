const User = require('../models/User');
const Mosque = require('../models/Mosque');
const PrayerTiming = require('../models/PrayerTiming');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

// @desc    Get dashboard stats for Root Admin
// @route   GET /api/admin/stats
// @access  Private (Root Admin)
const getDashboardStats = async (req, res) => {
  try {
    const totalMosques = await Mosque.countDocuments();
    const activeAdmins = await User.countDocuments({ role: 'MOSQUE_ADMIN', isActive: true });
    const totalAnnouncements = await Announcement.countDocuments();

    return res.json({
      totalMosques,
      activeAdmins,
      totalAnnouncements
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({ message: 'Server error retrieving statistics' });
  }
};

// @desc    Create a new Mosque
// @route   POST /api/admin/mosques
// @access  Private (Root Admin)
const createMosque = async (req, res) => {
  const {
    mosqueName,
    address,
    area,
    city,
    state,
    pincode,
    googleMapLink,
    latitude,
    longitude,
    facilities,
    contact,
    aboutMasjid,
    assignedUserId
  } = req.body;

  if (!mosqueName || !address || !area || !city || !state || !pincode || !googleMapLink) {
    return res.status(400).json({ message: 'All basic mosque fields are required' });
  }

  try {
    let assignedUser = null;
    if (assignedUserId) {
      assignedUser = await User.findById(assignedUserId);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      if (assignedUser.mosqueId) {
        return res.status(400).json({ message: `User ${assignedUser.name} is already assigned to another mosque` });
      }
    }

    const newMosque = new Mosque({
      mosqueName,
      address,
      area,
      city,
      state,
      pincode,
      googleMapLink,
      latitude: latitude || null,
      longitude: longitude || null,
      facilities: facilities || {},
      contact: contact || {},
      aboutMasjid: aboutMasjid || '',
      createdBy: req.user._id
    });

    const savedMosque = await newMosque.save();

    // Automatically initialize default empty prayer timings for the new mosque
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

    if (assignedUser) {
      assignedUser.mosqueId = savedMosque._id;
      await assignedUser.save();
    }

    return res.status(201).json(savedMosque);
  } catch (error) {
    console.error('Create mosque error:', error);
    return res.status(500).json({ message: 'Server error creating mosque' });
  }
};

// @desc    Update a Mosque
// @route   PUT /api/admin/mosques/:id
// @access  Private (Root Admin)
const updateMosque = async (req, res) => {
  const { id } = req.params;

  try {
    const mosque = await Mosque.findById(id);

    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    // Update fields from request body
    mosque.mosqueName = req.body.mosqueName || mosque.mosqueName;
    mosque.address = req.body.address || mosque.address;
    mosque.area = req.body.area || mosque.area;
    mosque.city = req.body.city || mosque.city;
    mosque.state = req.body.state || mosque.state;
    mosque.pincode = req.body.pincode || mosque.pincode;
    mosque.googleMapLink = req.body.googleMapLink || mosque.googleMapLink;
    mosque.latitude = req.body.latitude !== undefined ? req.body.latitude : mosque.latitude;
    mosque.longitude = req.body.longitude !== undefined ? req.body.longitude : mosque.longitude;
    mosque.aboutMasjid = req.body.aboutMasjid !== undefined ? req.body.aboutMasjid : mosque.aboutMasjid;

    if (req.body.facilities) {
      mosque.facilities = { ...mosque.facilities, ...req.body.facilities };
    }
    if (req.body.contact) {
      mosque.contact = { ...mosque.contact, ...req.body.contact };
    }
    if (req.body.mosqueImage) {
      mosque.mosqueImage = req.body.mosqueImage;
    }

    // Handle user assignment
    if (req.body.assignedUserId !== undefined) {
      // Find current user assigned to this mosque
      const currentAssignedUser = await User.findOne({ mosqueId: id, role: { $in: ['MOSQUE_ADMIN', 'IMAM', 'MUAZZIN'] } });
      
      if (req.body.assignedUserId === '') {
        // Unassign current user
        if (currentAssignedUser) {
          currentAssignedUser.mosqueId = null;
          await currentAssignedUser.save();
        }
      } else {
        // Assign to new user
        const newAssignedUser = await User.findById(req.body.assignedUserId);
        if (!newAssignedUser) {
          return res.status(404).json({ message: 'New assigned user not found' });
        }
        if (newAssignedUser.mosqueId && newAssignedUser.mosqueId.toString() !== id) {
          return res.status(400).json({ message: `User ${newAssignedUser.name} is already assigned to another mosque` });
        }
        
        // Remove assignment from old user
        if (currentAssignedUser && currentAssignedUser._id.toString() !== newAssignedUser._id.toString()) {
          currentAssignedUser.mosqueId = null;
          await currentAssignedUser.save();
        }
        
        newAssignedUser.mosqueId = id;
        await newAssignedUser.save();
      }
    }

    const updatedMosque = await mosque.save();
    return res.json(updatedMosque);
  } catch (error) {
    console.error('Update mosque error:', error);
    return res.status(500).json({ message: 'Server error updating mosque' });
  }
};

// @desc    Delete a Mosque
// @route   DELETE /api/admin/mosques/:id
// @access  Private (Root Admin)
const deleteMosque = async (req, res) => {
  const { id } = req.params;

  try {
    const mosque = await Mosque.findById(id);

    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    // Perform CASCADE deletion of prayer timings & announcements
    await PrayerTiming.deleteOne({ mosqueId: id });
    await Announcement.deleteMany({ mosqueId: id });

    // Set mosqueId of any associated Mosque Admins to null (or deactivate them)
    await User.updateMany({ mosqueId: id }, { mosqueId: null, isActive: false });

    // Delete the mosque
    await Mosque.findByIdAndDelete(id);

    return res.json({ message: 'Mosque and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete mosque error:', error);
    return res.status(500).json({ message: 'Server error deleting mosque' });
  }
};

// @desc    Get all mosques with search and pagination
// @route   GET /api/admin/mosques
// @access  Private (Root Admin)
const getMosques = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { mosqueName: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Mosque.countDocuments(query);
    const mosques = await Mosque.find(query)
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const mosquesWithAdmins = await Promise.all(
      mosques.map(async (mosque) => {
        const admin = await User.findOne({ mosqueId: mosque._id, role: 'MOSQUE_ADMIN' }).select('name email mobile isActive role');
        return {
          ...mosque.toObject(),
          admin: admin || null
        };
      })
    );

    return res.json({
      mosques: mosquesWithAdmins,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get mosques error:', error);
    return res.status(500).json({ message: 'Server error fetching mosques' });
  }
};

// @desc    Get list of Mosque Admins with search
// @route   GET /api/admin/admins
// @access  Private (Root Admin)
const getMosqueAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = { role: 'MOSQUE_ADMIN' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const admins = await User.find(query)
      .populate('mosqueId', 'mosqueName city')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      admins,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get admins error:', error);
    return res.status(500).json({ message: 'Server error fetching mosque admins' });
  }
};

// @desc    Create a new Mosque Admin and assign to Mosque
// @route   POST /api/admin/admins
// @access  Private (Root Admin)
const createAndAssignAdmin = async (req, res) => {
  const { name, email, mobile, password, mosqueId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password fields are required' });
  }

  try {
    // 1. Check if email is unique
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // 2. Check mosque details if assigned
    if (mosqueId) {
      const mosque = await Mosque.findById(mosqueId);
      if (!mosque) {
        return res.status(404).json({ message: 'Target Mosque not found' });
      }

      // Check if the mosque already has an admin
      const existingAdmin = await User.findOne({ mosqueId, role: 'MOSQUE_ADMIN' });
      if (existingAdmin) {
        return res.status(400).json({ message: `This mosque already has an admin assigned: ${existingAdmin.name}` });
      }
    }

    // 3. Create new user
    const admin = new User({
      name,
      email: email.toLowerCase(),
      mobile: mobile || '',
      password, // Pre-save hook hashes this
      role: 'MOSQUE_ADMIN',
      mosqueId: mosqueId || null,
      isActive: true
    });

    const savedAdmin = await admin.save();
    return res.status(201).json({
      message: 'User created successfully',
      admin: {
        _id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        mobile: savedAdmin.mobile,
        role: savedAdmin.role,
        mosqueId: savedAdmin.mosqueId,
        isActive: savedAdmin.isActive
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ message: 'Server error creating user' });
  }
};

// @desc    Update a Mosque Admin user details
// @route   PUT /api/admin/admins/:id
// @access  Private (Root Admin)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, mosqueId } = req.body;

  try {
    const user = await User.findById(id);
    if (!user || user.role !== 'MOSQUE_ADMIN') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email.toLowerCase();
    }

    user.name = name || user.name;
    user.mobile = mobile !== undefined ? mobile : user.mobile;

    // Handle mosqueId assignment change
    if (mosqueId !== undefined) {
      if (mosqueId === '' || mosqueId === null) {
        user.mosqueId = null;
      } else {
        // Check if mosque exists
        const mosque = await Mosque.findById(mosqueId);
        if (!mosque) {
          return res.status(404).json({ message: 'Mosque not found' });
        }
        // Check if mosque is already assigned to someone else
        const existingUser = await User.findOne({ mosqueId, _id: { $ne: id }, role: 'MOSQUE_ADMIN' });
        if (existingUser) {
          return res.status(400).json({ message: `This mosque is already assigned to user: ${existingUser.name}` });
        }
        user.mosqueId = mosqueId;
      }
    }

    const updatedUser = await user.save();
    return res.json({
      message: 'User updated successfully',
      admin: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Server error updating user details' });
  }
};

// @desc    Delete a Mosque Admin user
// @route   DELETE /api/admin/admins/:id
// @access  Private (Root Admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user || user.role !== 'MOSQUE_ADMIN') {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Deactivate / Activate Mosque Admin
// @route   PUT /api/admin/admins/:id/status
// @access  Private (Root Admin)
const toggleAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ message: 'isActive status boolean is required' });
  }

  try {
    const admin = await User.findById(id);

    if (!admin || admin.role !== 'MOSQUE_ADMIN') {
      return res.status(404).json({ message: 'Mosque Admin not found' });
    }

    admin.isActive = isActive;
    await admin.save();

    return res.json({
      message: `Admin account has been ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    return res.status(500).json({ message: 'Server error changing admin status' });
  }
};

// @desc    Reset password for Mosque Admin
// @route   PUT /api/admin/admins/:id/reset-password
// @access  Private (Root Admin)
const resetAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Please provide a valid new password (min 6 characters)' });
  }

  try {
    const admin = await User.findById(id);

    if (!admin || admin.role !== 'MOSQUE_ADMIN') {
      return res.status(404).json({ message: 'Mosque Admin not found' });
    }

    // Set new password (pre-save hook will hash it automatically)
    admin.password = newPassword;
    await admin.save();

    return res.json({ message: `Password for admin '${admin.name}' reset successfully.` });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error resetting admin password' });
  }
};

// @desc    Get unassigned mosque users
// @route   GET /api/admin/unassigned-users
// @access  Private (Root Admin)
const getUnassignedUsers = async (req, res) => {
  try {
    const { excludeMosqueId } = req.query;

    const query = {
      role: 'MOSQUE_ADMIN',
      $or: [
        { mosqueId: null },
        { mosqueId: { $exists: false } }
      ]
    };

    if (excludeMosqueId) {
      query.$or.push({ mosqueId: excludeMosqueId });
    }

    const users = await User.find(query).select('name email role');
    return res.json(users);
  } catch (error) {
    console.error('Error fetching unassigned users:', error);
    return res.status(500).json({ message: 'Server error fetching unassigned users' });
  }
};

// @desc    Get prayer timings of any mosque
// @route   GET /api/admin/mosques/:mosqueId/timings
// @access  Private (Root Admin)
const getMosqueTimings = async (req, res) => {
  const { mosqueId } = req.params;
  try {
    const timings = await PrayerTiming.findOne({ mosqueId });
    if (!timings) {
      return res.status(404).json({ message: 'Timings not found' });
    }
    return res.json(timings);
  } catch (error) {
    console.error('Get mosque timings error:', error);
    return res.status(500).json({ message: 'Server error retrieving timings' });
  }
};

// @desc    Update prayer timings of any mosque
// @route   PUT /api/admin/mosques/:mosqueId/timings
// @access  Private (Root Admin)
const updateMosqueTimings = async (req, res) => {
  const { mosqueId } = req.params;
  try {
    let timings = await PrayerTiming.findOne({ mosqueId });
    if (!timings) {
      timings = new PrayerTiming({ mosqueId });
    }

    // Assign timings and track modifications for Fajr, Asr, Maghrib, Isha
    if (req.body.Fajr) {
      if (req.body.Fajr.azan !== timings.Fajr.azan || req.body.Fajr.jamaat !== timings.Fajr.jamaat) {
        timings.lastUpdatedFajr = Date.now();
      }
      timings.Fajr = { ...timings.Fajr, ...req.body.Fajr };
    }
    if (req.body.Zuhr) {
      timings.Zuhr = { ...timings.Zuhr, ...req.body.Zuhr };
    }
    if (req.body.Asr) {
      if (req.body.Asr.azan !== timings.Asr.azan || req.body.Asr.jamaat !== timings.Asr.jamaat) {
        timings.lastUpdatedAsr = Date.now();
      }
      timings.Asr = { ...timings.Asr, ...req.body.Asr };
    }
    if (req.body.Maghrib) {
      if (req.body.Maghrib.azan !== timings.Maghrib.azan || req.body.Maghrib.jamaat !== timings.Maghrib.jamaat) {
        timings.lastUpdatedMaghrib = Date.now();
      }
      timings.Maghrib = { ...timings.Maghrib, ...req.body.Maghrib };
    }
    if (req.body.Isha) {
      if (req.body.Isha.azan !== timings.Isha.azan || req.body.Isha.jamaat !== timings.Isha.jamaat) {
        timings.lastUpdatedIsha = Date.now();
      }
      timings.Isha = { ...timings.Isha, ...req.body.Isha };
    }
    if (req.body.Jumma) {
      timings.Jumma = { ...timings.Jumma, ...req.body.Jumma };
    }

    const updatedTimings = await timings.save();
    return res.json(updatedTimings);
  } catch (error) {
    console.error('Update mosque timings error:', error);
    return res.status(500).json({ message: 'Server error updating timings' });
  }
};

// @desc    Upload image for any mosque by Admin
// @route   POST /api/admin/mosques/:id/upload-image
// @access  Private (Root Admin)
const uploadMosqueImageByAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const mosque = await Mosque.findById(id);
    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    // Upload via helper (handles Cloudinary with local fallback)
    const imageUrl = await uploadToCloudinary(req.file);

    mosque.mosqueImage = imageUrl;
    await mosque.save();

    return res.json({
      message: 'Mosque image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Mosque admin image upload error:', error);
    return res.status(500).json({ message: 'Server error uploading image' });
  }
};

module.exports = {
  getDashboardStats,
  createMosque,
  updateMosque,
  deleteMosque,
  getMosques,
  getMosqueAdmins,
  createAndAssignAdmin,
  updateUser,
  deleteUser,
  toggleAdminStatus,
  resetAdminPassword,
  getUnassignedUsers,
  getMosqueTimings,
  updateMosqueTimings,
  uploadMosqueImageByAdmin
};

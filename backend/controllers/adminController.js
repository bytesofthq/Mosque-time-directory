const User = require('../models/User');
const Mosque = require('../models/Mosque');
const PrayerTiming = require('../models/PrayerTiming');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');

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
    aboutMasjid
  } = req.body;

  if (!mosqueName || !address || !area || !city || !state || !pincode || !googleMapLink) {
    return res.status(400).json({ message: 'All basic mosque fields are required' });
  }

  try {
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
      Jumma: { khutbah: '01:00', jamaat: '01:30' }
    });

    await defaultTimings.save();

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

    // Let's attach admin details to each mosque for convenience
    const mosquesWithAdmins = await Promise.all(
      mosques.map(async (mosque) => {
        const admin = await User.findOne({ mosqueId: mosque._id, role: 'MOSQUE_ADMIN' }).select('name email mobile isActive');
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

  if (!name || !email || !mobile || !password || !mosqueId) {
    return res.status(400).json({ message: 'All admin fields and mosque assignment are required' });
  }

  try {
    // 1. Check if email is unique
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // 2. Check if the target mosque exists
    const mosque = await Mosque.findById(mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Target Mosque not found' });
    }

    // 3. Check if the mosque already has an admin
    const existingAdmin = await User.findOne({ mosqueId, role: 'MOSQUE_ADMIN' });
    if (existingAdmin) {
      return res.status(400).json({ message: `This mosque already has an admin assigned: ${existingAdmin.name}` });
    }

    // 4. Create new admin
    const admin = new User({
      name,
      email: email.toLowerCase(),
      mobile,
      password, // Pre-save hook hashes this
      role: 'MOSQUE_ADMIN',
      mosqueId,
      isActive: true
    });

    const savedAdmin = await admin.save();
    return res.status(201).json({
      message: 'Mosque admin created and assigned successfully',
      admin: {
        _id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        mobile: savedAdmin.mobile,
        mosqueId: savedAdmin.mosqueId,
        isActive: savedAdmin.isActive
      }
    });
  } catch (error) {
    console.error('Assign admin error:', error);
    return res.status(500).json({ message: 'Server error creating and assigning admin' });
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

module.exports = {
  getDashboardStats,
  createMosque,
  updateMosque,
  deleteMosque,
  getMosques,
  getMosqueAdmins,
  createAndAssignAdmin,
  toggleAdminStatus,
  resetAdminPassword
};

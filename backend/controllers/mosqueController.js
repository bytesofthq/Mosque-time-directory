const Mosque = require('../models/Mosque');
const PrayerTiming = require('../models/PrayerTiming');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

// ==========================================
// MOSQUE ADMIN CONTROLLER FUNCTIONS (Private)
// ==========================================

// @desc    Get admin's assigned mosque details
// @route   GET /api/mosque/my-mosque
// @access  Private (Mosque Admin)
const getMyMosque = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    const mosque = await Mosque.findById(req.user.mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Assigned mosque not found' });
    }

    const timings = await PrayerTiming.findOne({ mosqueId: mosque._id });
    const announcements = await Announcement.find({ mosqueId: mosque._id }).sort({ createdAt: -1 });

    return res.json({
      mosque,
      timings,
      announcements
    });
  } catch (error) {
    console.error('Get my mosque error:', error);
    return res.status(500).json({ message: 'Server error fetching mosque details' });
  }
};

// @desc    Update admin's assigned mosque details
// @route   PUT /api/mosque/my-mosque
// @access  Private (Mosque Admin)
const updateMyMosque = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    const mosque = await Mosque.findById(req.user.mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Assigned mosque not found' });
    }

    // Update details
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

    const updatedMosque = await mosque.save();
    return res.json(updatedMosque);
  } catch (error) {
    console.error('Update my mosque error:', error);
    return res.status(500).json({ message: 'Server error updating mosque details' });
  }
};

// @desc    Upload image for mosque
// @route   POST /api/mosque/my-mosque/upload-image
// @access  Private (Mosque Admin)
const uploadMosqueImage = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const mosque = await Mosque.findById(req.user.mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Assigned mosque not found' });
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
    console.error('Mosque image upload error:', error);
    return res.status(500).json({ message: 'Server error uploading image' });
  }
};

// @desc    Get prayer timings of own mosque
// @route   GET /api/mosque/my-mosque/timings
// @access  Private (Mosque Admin)
const getMyMosqueTimings = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    const timings = await PrayerTiming.findOne({ mosqueId: req.user.mosqueId });
    if (!timings) {
      return res.status(404).json({ message: 'Timings not found' });
    }

    return res.json(timings);
  } catch (error) {
    console.error('Get timings error:', error);
    return res.status(500).json({ message: 'Server error fetching timings' });
  }
};

// @desc    Update prayer timings
// @route   PUT /api/mosque/my-mosque/timings
// @access  Private (Mosque Admin)
const updateMyMosqueTimings = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    let timings = await PrayerTiming.findOne({ mosqueId: req.user.mosqueId });
    if (!timings) {
      timings = new PrayerTiming({ mosqueId: req.user.mosqueId });
    }

    // Assign timings from body
    if (req.body.Fajr) timings.Fajr = { ...timings.Fajr, ...req.body.Fajr };
    if (req.body.Zuhr) timings.Zuhr = { ...timings.Zuhr, ...req.body.Zuhr };
    if (req.body.Asr) timings.Asr = { ...timings.Asr, ...req.body.Asr };
    if (req.body.Maghrib) timings.Maghrib = { ...timings.Maghrib, ...req.body.Maghrib };
    if (req.body.Isha) timings.Isha = { ...timings.Isha, ...req.body.Isha };
    if (req.body.Jumma) timings.Jumma = { ...timings.Jumma, ...req.body.Jumma };

    const updatedTimings = await timings.save();
    return res.json(updatedTimings);
  } catch (error) {
    console.error('Update timings error:', error);
    return res.status(500).json({ message: 'Server error updating timings' });
  }
};

// ==========================================
// PUBLIC CONTROLLER FUNCTIONS (Public)
// ==========================================

// @desc    Search and list mosques with pagination
// @route   GET /api/public/mosques
// @access  Public
const getPublicMosques = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const area = req.query.area || '';

    const query = {};
    if (search) {
      query.mosqueName = { $regex: search, $options: 'i' };
    }
    if (area) {
      query.area = { $regex: area, $options: 'i' };
    }

    const total = await Mosque.countDocuments(query);
    const mosques = await Mosque.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ mosqueName: 1 });

    return res.json({
      mosques,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Public mosques error:', error);
    return res.status(500).json({ message: 'Server error fetching mosques' });
  }
};

// @desc    Get detailed mosque page by ID
// @route   GET /api/public/mosques/:id
// @access  Public
const getPublicMosqueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const mosque = await Mosque.findById(id);

    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    const timings = await PrayerTiming.findOne({ mosqueId: id });
    const announcements = await Announcement.find({ mosqueId: id }).sort({ createdAt: -1 });

    return res.json({
      mosque,
      timings: timings || {},
      announcements: announcements || []
    });
  } catch (error) {
    console.error('Public mosque detail error:', error);
    return res.status(500).json({ message: 'Server error fetching mosque details' });
  }
};

module.exports = {
  getMyMosque,
  updateMyMosque,
  uploadMosqueImage,
  getMyMosqueTimings,
  updateMyMosqueTimings,
  getPublicMosques,
  getPublicMosqueDetails
};

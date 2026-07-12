const Mosque = require('../models/Mosque');
const { getNearbyMosquesWithWalkingDistance } = require('../utils/locationHelper');
const PrayerTiming = require('../models/PrayerTiming');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Hadith = require('../models/Hadith');
const path = require('path');
const fs = require('fs');
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

    // Assign timings from body and check if they changed to update the modification timestamp
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
    const andConditions = [];

    if (search) {
      const searchWords = search.trim().split(/\s+/).filter(Boolean);
      if (searchWords.length > 0) {
        searchWords.forEach(word => {
          andConditions.push({
            $or: [
              { mosqueName: { $regex: word, $options: 'i' } },
              { area: { $regex: word, $options: 'i' } },
              { city: { $regex: word, $options: 'i' } },
              { address: { $regex: word, $options: 'i' } }
            ]
          });
        });
      }
    }

    if (area) {
      const areaWords = area.trim().split(/\s+/).filter(Boolean);
      if (areaWords.length > 0) {
        areaWords.forEach(word => {
          andConditions.push({
            $or: [
              { area: { $regex: word, $options: 'i' } },
              { city: { $regex: word, $options: 'i' } },
              { address: { $regex: word, $options: 'i' } }
            ]
          });
        });
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
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

// @desc    Get detailed mosque page by ID or Slug
// @route   GET /api/public/mosques/:id
// @access  Public
const getPublicMosqueDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let mosque;

    if (mongoose.Types.ObjectId.isValid(id)) {
      mosque = await Mosque.findById(id);
    } else {
      mosque = await Mosque.findOne({ slug: id });
    }

    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    const timings = await PrayerTiming.findOne({ mosqueId: mosque._id });
    const announcements = await Announcement.find({ mosqueId: mosque._id }).sort({ createdAt: -1 });

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

// @desc    Get nearby mosques by radius filtering using Geospatial indexing & OSRM Foot Routing API
// @route   GET /api/public/mosques-nearby
// @access  Public
const getNearbyMosques = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ message: 'Latitude, longitude, and radius are required parameters' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const filterRadius = parseFloat(radius);

    if (isNaN(userLat) || isNaN(userLng) || isNaN(filterRadius)) {
      return res.status(400).json({ message: 'Invalid latitude, longitude, or radius values' });
    }

    // Retrieve mosques matching geospatial search and fetch actual walking route distances
    // Limit to 20 candidate mosques to optimize OSRM query counts
    const nearbyMosques = await getNearbyMosquesWithWalkingDistance(
      userLat,
      userLng,
      filterRadius,
      20
    );

    return res.json(nearbyMosques);
  } catch (error) {
    console.error('Get nearby mosques error:', error);
    return res.status(500).json({ message: 'Server error retrieving nearby mosques' });
  }
};

// @desc    Upload multiple gallery images for mosque
// @route   POST /api/mosque/my-mosque/upload-gallery
// @access  Private (Mosque Admin)
const uploadMosqueGallery = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is currently assigned to your account' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image file' });
    }

    const mosque = await Mosque.findById(req.user.mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Assigned mosque not found' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const url = await uploadToCloudinary(file);
      imageUrls.push(url);
    }

    if (!mosque.images) {
      mosque.images = [];
    }
    mosque.images.push(...imageUrls);
    await mosque.save();

    return res.json({
      message: 'Gallery images uploaded successfully',
      images: mosque.images
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return res.status(500).json({ message: 'Server error uploading gallery images' });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/mosque/my-mosque/gallery
// @access  Private (Mosque Admin)
const deleteMosqueGalleryImage = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'imageUrl is required' });
  }

  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque is assigned to your account' });
    }

    const mosque = await Mosque.findById(req.user.mosqueId);
    if (!mosque) {
      return res.status(404).json({ message: 'Mosque not found' });
    }

    mosque.images = mosque.images.filter(img => img !== imageUrl);
    await mosque.save();

    return res.json({
      message: 'Gallery image deleted successfully',
      images: mosque.images
    });
  } catch (error) {
    console.error('Gallery image deletion error:', error);
    return res.status(500).json({ message: 'Server error deleting gallery image' });
  }
};

let cachedHadith = null;
let cachedDate = '';

const splitIntoChunks = (text, maxLength = 450) => {
  if (!text) return [];
  const chunks = [];
  let currentChunk = '';
  
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+(\s+|$)/g) || [text];
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      if (sentence.length <= maxLength) {
        currentChunk = sentence;
      } else {
        const words = sentence.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk + ' ' + word).trim().length <= maxLength) {
            currentChunk = (currentChunk + ' ' + word).trim();
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            currentChunk = word;
          }
        }
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

const translateText = async (text, targetLang) => {
  if (!text) return '';
  try {
    const chunks = splitIntoChunks(text, 450);
    const translatedChunks = [];
    
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        translatedChunks.push(data.responseData.translatedText);
      } else {
        console.warn(`Translation API response warning/error (Status: ${data?.responseStatus}):`, data?.responseDetails || 'No details');
        translatedChunks.push(chunk);
      }
    }
    
    return translatedChunks.join(' ');
  } catch (err) {
    console.error(`Translation error to ${targetLang}:`, err.message);
    return text;
  }
};

const getHadithOfTheDay = async (req, res) => {
  try {
    const totalCount = await Hadith.countDocuments();
    if (totalCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No Hadith data found. Please import Hadith collection."
      });
    }

    const { refresh } = req.query;
    const todayStr = new Date().toDateString();
    if (refresh !== 'true' && cachedHadith && cachedDate === todayStr) {
      return res.json(cachedHadith);
    }

    let index;
    if (refresh === 'true') {
      index = Math.floor(Math.random() * totalCount);
    } else {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      index = Math.abs(hash) % totalCount;
    }

    const selected = await Hadith.findOne().skip(index);
    if (!selected) {
      return res.status(404).json({
        success: false,
        message: "Hadith not found at the generated index."
      });
    }

    const reference = selected.info ? selected.info.replace(':', '').trim() : '';
    const narrator = selected.by ? selected.by.trim() : '';
    const englishText = selected.text ? selected.text.trim() : '';

    let hindiText = selected.textHindi ? selected.textHindi.trim() : '';
    let urduText = selected.textUrdu ? selected.textUrdu.trim() : '';
    let needsSave = false;

    if (!hindiText) {
      console.log(`Translating Hadith (Index: ${index}) to Hindi...`);
      hindiText = await translateText(englishText, 'hi');
      selected.textHindi = hindiText;
      needsSave = true;
    }

    if (!urduText) {
      console.log(`Translating Hadith (Index: ${index}) to Urdu...`);
      urduText = await translateText(englishText, 'ur');
      selected.textUrdu = urduText;
      needsSave = true;
    }

    if (needsSave) {
      try {
        await selected.save();
        console.log(`Saved translations to database for Hadith: ${reference}`);
      } catch (saveError) {
        console.error('Error saving translation cache to database:', saveError.message);
      }
    }

    const result = {
      reference,
      narrator,
      text: {
        en: englishText,
        hi: hindiText,
        ur: urduText
      }
    };

    if (refresh !== 'true') {
      cachedHadith = result;
      cachedDate = todayStr;
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching Hadith of the Day:', error);
    return res.status(500).json({ message: 'Server error retrieving Hadith of the Day' });
  }
};

// @desc    Create a mosque for the logged-in admin user
// @route   POST /api/mosque/my-mosque
// @access  Private (Mosque Admin/Imam/Muazzin)
const createMyMosque = async (req, res) => {
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
    aboutMasjid,
    facilities,
    contact
  } = req.body;

  if (!mosqueName || !address || !area || !city || !state || !pincode || !googleMapLink) {
    return res.status(400).json({ message: 'All basic mosque fields are required' });
  }

  try {
    if (req.user.mosqueId) {
      return res.status(400).json({ message: 'Your account is already assigned to a mosque' });
    }

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
      facilities: facilities || {},
      contact: contact || {},
      createdBy: req.user._id
    });

    const savedMosque = await mosque.save();

    // Automatically initialize default prayer timings for the new mosque
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

    // Assign the new mosque's ID to the logged-in user
    const user = await User.findById(req.user._id);
    user.mosqueId = savedMosque._id;
    await user.save();

    return res.status(201).json({
      message: 'Mosque created and assigned successfully',
      mosque: savedMosque,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        mosqueId: user.mosqueId
      }
    });
  } catch (error) {
    console.error('Create my mosque error:', error);
    return res.status(500).json({ message: 'Server error creating mosque' });
  }
};

module.exports = {
  getMyMosque,
  createMyMosque,
  updateMyMosque,
  uploadMosqueImage,
  getMyMosqueTimings,
  updateMyMosqueTimings,
  getPublicMosques,
  getPublicMosqueDetails,
  getNearbyMosques,
  uploadMosqueGallery,
  deleteMosqueGalleryImage,
  getHadithOfTheDay
};

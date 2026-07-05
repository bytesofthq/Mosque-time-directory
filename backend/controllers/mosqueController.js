const Mosque = require('../models/Mosque');
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

// @desc    Get nearby mosques by radius filtering (100m, 200m, 500m, 1km)
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

    const mosques = await Mosque.find({
      latitude: { $ne: null },
      longitude: { $ne: null }
    });

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // meters
      const phi1 = lat1 * Math.PI / 180;
      const phi2 = lat2 * Math.PI / 180;
      const deltaPhi = (lat2 - lat1) * Math.PI / 180;
      const deltaLambda = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // distance in meters
    };

    const nearbyMosques = mosques
      .map(mosque => {
        const distance = getDistance(userLat, userLng, mosque.latitude, mosque.longitude);
        return { ...mosque.toObject(), distance };
      })
      .filter(mosque => mosque.distance <= filterRadius)
      .sort((a, b) => a.distance - b.distance);

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

    const todayStr = new Date().toDateString();
    if (cachedHadith && cachedDate === todayStr) {
      return res.json(cachedHadith);
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % totalCount;
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

    console.log(`Translating Hadith of the Day (Index: ${index}) to Hindi and Urdu...`);
    const hindiText = await translateText(englishText, 'hi');
    const urduText = await translateText(englishText, 'ur');

    const result = {
      reference,
      narrator,
      text: {
        en: englishText,
        hi: hindiText,
        ur: urduText
      }
    };

    cachedHadith = result;
    cachedDate = todayStr;

    return res.json(result);
  } catch (error) {
    console.error('Error fetching Hadith of the Day:', error);
    return res.status(500).json({ message: 'Server error retrieving Hadith of the Day' });
  }
};

module.exports = {
  getMyMosque,
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

const Announcement = require('../models/Announcement');
const Mosque = require('../models/Mosque');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

// @desc    Get all announcements (for Root Admin sidebar)
// @route   GET /api/admin/announcements
// @access  Private (Root Admin)
const getAllAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Announcement.countDocuments();
    const announcements = await Announcement.find()
      .populate('mosqueId', 'mosqueName city')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({
      announcements,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    return res.status(500).json({ message: 'Server error retrieving announcements' });
  }
};

// @desc    Get own mosque's announcements
// @route   GET /api/mosque/my-mosque/announcements
// @access  Private (Mosque Admin)
const getMyAnnouncements = async (req, res) => {
  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque assigned to your account' });
    }

    const announcements = await Announcement.find({ mosqueId: req.user.mosqueId })
      .sort({ createdAt: -1 });

    return res.json(announcements);
  } catch (error) {
    console.error('Get my announcements error:', error);
    return res.status(500).json({ message: 'Server error retrieving announcements' });
  }
};

// @desc    Create a new announcement for own mosque
// @route   POST /api/mosque/my-mosque/announcements
// @access  Private (Mosque Admin)
const createAnnouncement = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque assigned to your account' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const announcement = new Announcement({
      mosqueId: req.user.mosqueId,
      title,
      description,
      image: imageUrl
    });

    const savedAnnouncement = await announcement.save();
    return res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ message: 'Server error creating announcement' });
  }
};

// @desc    Update an announcement
// @route   PUT /api/mosque/my-mosque/announcements/:id
// @access  Private (Mosque Admin)
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    if (!req.user.mosqueId) {
      return res.status(400).json({ message: 'No mosque assigned to your account' });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Verify ownership
    if (announcement.mosqueId.toString() !== req.user.mosqueId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    announcement.title = title || announcement.title;
    announcement.description = description || announcement.description;

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file);
      announcement.image = imageUrl;
    }

    const updatedAnnouncement = await announcement.save();
    return res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Update announcement error:', error);
    return res.status(500).json({ message: 'Server error updating announcement' });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/mosque/my-mosque/announcements/:id
// @access  Private (Mosque Admin, Root Admin can also delete via generic admin route or directly)
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Root Admin can delete any announcement, Mosque Admin can only delete their own
    if (req.user.role !== 'ROOT_ADMIN') {
      if (!req.user.mosqueId || announcement.mosqueId.toString() !== req.user.mosqueId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this announcement' });
      }
    }

    await Announcement.findByIdAndDelete(id);
    return res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return res.status(500).json({ message: 'Server error deleting announcement' });
  }
};

module.exports = {
  getAllAnnouncements,
  getMyAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

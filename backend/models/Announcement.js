const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  mosqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mosque',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);

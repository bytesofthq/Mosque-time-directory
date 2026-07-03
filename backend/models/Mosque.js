const mongoose = require('mongoose');

const MosqueSchema = new mongoose.Schema({
  mosqueName: {
    type: String,
    required: true,
    trim: true
  },
  mosqueImage: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  googleMapLink: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  facilities: {
    parking: { type: Boolean, default: false },
    wuduArea: { type: Boolean, default: false },
    ladiesPrayer: { type: Boolean, default: false },
    wheelchairAccess: { type: Boolean, default: false },
    madrasa: { type: Boolean, default: false },
    library: { type: Boolean, default: false }
  },
  contact: {
    imamName: { type: String, default: '' },
    imamMobile: { type: String, default: '' }
  },
  aboutMasjid: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mosque', MosqueSchema);

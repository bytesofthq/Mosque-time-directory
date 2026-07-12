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
  images: {
    type: [String],
    default: []
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
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index the location field for geospatial queries
MosqueSchema.index({ location: '2dsphere' });

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

MosqueSchema.pre('save', async function(next) {
  // Automatically synchronize GeoJSON location coordinates whenever latitude or longitude is modified
  if (this.isModified('latitude') || this.isModified('longitude') || !this.location || !this.location.coordinates) {
    if (this.latitude !== null && this.longitude !== null && this.latitude !== undefined && this.longitude !== undefined) {
      this.location = {
        type: 'Point',
        coordinates: [Number(this.longitude), Number(this.latitude)]
      };
    }
  }

  if (this.isModified('mosqueName') || !this.slug) {
    let generatedSlug = slugify(this.mosqueName);
    const Mosque = mongoose.model('Mosque');
    let count = 0;
    let existing = await Mosque.findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    while (existing) {
      count++;
      generatedSlug = `${slugify(this.mosqueName)}-${count}`;
      existing = await Mosque.findOne({ slug: generatedSlug, _id: { $ne: this._id } });
    }
    this.slug = generatedSlug;
  }
  next();
});

module.exports = mongoose.model('Mosque', MosqueSchema);

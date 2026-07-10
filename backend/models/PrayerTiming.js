const mongoose = require('mongoose');

const PrayerTimingSchema = new mongoose.Schema({
  mosqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mosque',
    required: true,
    unique: true
  },
  Fajr: {
    azan: { type: String, default: '--:--' },
    jamaat: { type: String, default: '--:--' }
  },
  Zuhr: {
    azan: { type: String, default: '--:--' },
    jamaat: { type: String, default: '--:--' }
  },
  Asr: {
    azan: { type: String, default: '--:--' },
    jamaat: { type: String, default: '--:--' }
  },
  Maghrib: {
    azan: { type: String, default: '--:--' },
    jamaat: { type: String, default: '--:--' }
  },
  Isha: {
    azan: { type: String, default: '--:--' },
    jamaat: { type: String, default: '--:--' }
  },
  Jumma: {
    azan: { type: String, default: '--:--' },
    khutbah: { type: String, default: '--:--' }
  },
  lastUpdatedFajr: { type: Date, default: Date.now },
  lastUpdatedAsr: { type: Date, default: Date.now },
  lastUpdatedMaghrib: { type: Date, default: Date.now },
  lastUpdatedIsha: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('PrayerTiming', PrayerTimingSchema);

const mongoose = require('mongoose');

const HadithSchema = new mongoose.Schema({
  volumeName: {
    type: String,
    required: true
  },
  bookName: {
    type: String,
    required: true
  },
  info: {
    type: String,
    default: ''
  },
  by: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  },
  textHindi: {
    type: String,
    default: ''
  },
  textUrdu: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Hadith', HadithSchema);

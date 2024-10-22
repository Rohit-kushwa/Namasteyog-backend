const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  videoPath: {
    type: String,
    required: true
  },
  status: {
      type: Boolean,
      default: true // Default status is true
  },
  isDeleted: {
      type: Boolean,
      default: false // Default status is true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', VideoSchema);

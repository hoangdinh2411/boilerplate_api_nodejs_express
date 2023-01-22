const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimetype: { type: String },
  createdBy: {
    type: String,
    required: true,
  },
  createdName: {
    type: String,
    default: 'User',
    required: true,
  },
});

module.exports = mongoose.model('media', mediaSchema, 'media');

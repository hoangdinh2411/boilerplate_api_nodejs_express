const mongoose = require('mongoose');

const currentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  iso: {
    type: String,
    required: true,
  },
  current: {
    type: String,
    required: true,
  },
  image: String,
  status: {
    type: Number,
    default: 1,
    required: false,
  },
  type: {
    type: Number,
    default: 1,
    required: false,
  },
  sort: {
    type: Number,
    default: 1,
  },
  rate: {
    type: Number,
    default: 1,
  },
  currentType: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

currentSchema.index({ name: 1, iso: 1, current: 1 }, { unique: true });
// currentSchema.index({ name: "text" }, { language_override: "english" });

module.exports = mongoose.model('current', currentSchema, 'current');

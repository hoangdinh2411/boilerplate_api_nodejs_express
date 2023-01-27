const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  iso: {
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

countrySchema.index({ name: 1, iso: 1, locale: 1 }, { unique: true });
// countrySchema.index({ name: "text" }, { language_override: "english" });

module.exports = mongoose.model('country', countrySchema, 'country');

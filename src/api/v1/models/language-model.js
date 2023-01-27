const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  locale: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 1,
    required: false,
  },
  image: String,
  sort: {
    type: Number,
    default: 1,
  },
  type: {
    type: Number,
    default: 1,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

languageSchema.index({ name: 'text' }, { language_override: 'english' });

module.exports = mongoose.model('language', languageSchema, 'language');

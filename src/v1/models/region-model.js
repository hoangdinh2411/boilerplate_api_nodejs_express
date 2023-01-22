const mongoose = require('mongoose');

const pointDefaultSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const regionsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  iso: {
    type: String,
    required: true,
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'country',
    required: true,
  },
  image: {
    type: String,
    // required: true,
  },
  location: {
    type: pointDefaultSchema,
    required: true,
  },
  parentId: {
    type: String,
    default: '',
    ref: 'regions',
  },
  status: {
    type: String,
    default: 'active',
  },
  type: {
    type: String, //province, district
    required: true,
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

regionsSchema.index({ location: '2dsphere' });
regionsSchema.index({ name: 'text' }, { language_override: 'english' });

module.exports = mongoose.model('regions', regionsSchema, 'regions');

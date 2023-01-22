const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shortName: {
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
    required: true,
  },
  status: {
    type: Number,
    default: 1,
    required: false,
  },
  type: {
    type: Number,
    default: 1, //1 nội địa, 2 quốc tế
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

bankSchema.index({ shortName: 1, country: 1 }, { unique: true });
// bankSchema.index({ name: "text" }, { language_override: "english" });

module.exports = mongoose.model('bank', bankSchema, 'bank');

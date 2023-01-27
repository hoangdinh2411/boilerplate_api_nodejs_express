const mongoose = require('mongoose');

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  deviceToken: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

userDeviceSchema.index({ userId: 1, deviceToken: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('user_device', userDeviceSchema, 'user_device');

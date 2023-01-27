const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'new',
  },
  targetId: String,
  targetName: String,
  type: {
    type: String,
    default: 'verify-email',
  },
  createdTime: {
    type: Number,
  },
});

module.exports = mongoose.model('otp', OtpSchema, 'otp');

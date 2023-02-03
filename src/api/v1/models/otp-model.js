const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const OtpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'verify-email',
  },
  time: {
    type: Date,
    default: Date.now,
    index: { expires: 7 * 60 },
  },
});

OtpSchema.pre('save', async function (done) {
  this.code = bcrypt.hashSync(this.code, 10);
  done();
});

module.exports = mongoose.model('otp', OtpSchema, 'otp');

const mongoose = require('mongoose');

const TokenLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

const TokenLogModel = mongoose.model('token_log', TokenLogSchema, 'token_log');

module.exports = TokenLogModel;

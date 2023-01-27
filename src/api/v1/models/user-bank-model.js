const mongoose = require('mongoose');

const userBankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bank',
    required: true,
  },
  branch: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
    validate: /^\d+$/,
  },
  type: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: 'active',
  },
});

module.exports = mongoose.model('user_bank', userBankSchema, 'user_bank');

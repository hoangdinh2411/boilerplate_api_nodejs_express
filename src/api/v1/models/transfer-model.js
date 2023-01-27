const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  status: String,
  method: String,
  amount: Number,
  desc: String,
  status: Number,
  transId: String,
  extra: String,
  checksum: String,
  targetId: { type: String, default: '' },
  targetName: { type: String, default: '' },
});

module.exports = mongoose.model('transfer', transferSchema, 'transfer');

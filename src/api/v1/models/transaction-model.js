const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  status: {
    type: String,
    default: 'pending', // success,
  },
  id: { type: String, unique: true },
  amount: { type: Number, min: 0, default: 0 },
  received: { type: Number, min: 0, default: 0 },
  type: {
    type: String,
    default: 'wallet', //  wallet: ví, about-wallet: trả tiền về ví, withdraw: rút tiền,refund: hoàn tiền
    required: true,
  },
  payment: {
    type: String,
    default: 'wallet', // wallet từ ví, momo, transfer chuyển khoản, transaction từ giao dịch thành công, epay: thanh toán trực tuyến
  },
  targetId: { type: String, default: '' },
  targetName: { type: String, default: '' },
  params: Object,
  userId: {
    type: String,
    default: '',
  },
  notes: {
    type: Array,
    default: [],
  },
  refund: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('transaction', transactionSchema, 'transaction');

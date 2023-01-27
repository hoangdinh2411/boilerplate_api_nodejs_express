const mongoose = require('mongoose');

const notificationStatusSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  view: {
    type: Number,
    default: 1,
  },
  read: {
    type: Number,
    default: 1,
  },
  type: String,
});

module.exports = mongoose.model(
  'notification_status',
  notificationStatusSchema,
  'notification_status',
);

const mongoose = require('mongoose');

const notificationTopicDeviceSchema = new mongoose.Schema({
  notificationTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification_topic',
    required: true,
  },
  userDeviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user_device',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

module.exports = mongoose.model(
  'notification_topic_device',
  notificationTopicDeviceSchema,
  'notification_topic_device',
);

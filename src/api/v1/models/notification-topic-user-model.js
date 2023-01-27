const mongoose = require('mongoose');

const notificationTopicUserSchema = new mongoose.Schema({
  notificationTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification_topic',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

module.exports = mongoose.model(
  'notification_topic_user',
  notificationTopicUserSchema,
  'notification_topic_user',
);

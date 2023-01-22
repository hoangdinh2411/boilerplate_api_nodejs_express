const mongoose = require('mongoose');

const notificationTopicSchema = new mongoose.Schema({
  title: String,
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Number,
    default: 1, // 2 render, 1 create
  },
  type: {
    type: Number,
    default: 1, // 1 render, 2 map
  },
  mapId: String,
});

module.exports = mongoose.model(
  'notification_topic',
  notificationTopicSchema,
  'notification_topic',
);

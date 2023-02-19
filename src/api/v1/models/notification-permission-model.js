const mongoose = require('mongoose');

const notificationPermissionSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'notification',
    required: true,
  },
  readBy: String,
  type: {
    type: String,
    default: 'all', // users, topic
  },
});

module.exports = mongoose.model(
  'notification_permission',
  notificationPermissionSchema,
  'notification_permission',
);

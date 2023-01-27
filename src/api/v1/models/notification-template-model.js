const mongoose = require('mongoose');

const notificationContent = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  content: {
    type: String,
  },
  language: {
    type: String,
    default: 'vi',
  },
});

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    default: 'active',
  },
  type: {
    type: Number,
    default: 1,
  },
  contents: [notificationContent],
  keyword: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

module.exports = mongoose.model(
  'notification_template',
  notificationTemplateSchema,
  'notification_template',
);

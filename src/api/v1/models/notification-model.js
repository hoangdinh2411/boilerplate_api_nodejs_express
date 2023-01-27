const mongoose = require('mongoose');
const notificationModule = require('@v1/modules/notification-module');

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

const notificationSchema = new mongoose.Schema({
  contents: [notificationContent],
  status: {
    type: String,
    default: 'new', // send
  },
  type: {
    type: String,
    default: '', // email-verify, phone-verify, campaign-public, campaign-donate...
  },
  typeSend: {
    type: String,
    default: 'all', // all, topics, users
  },
  action: Object,
});

notificationSchema.pre(/(updateOne|findOneAndUpdate)/, async function (done) {
  let data = this.getUpdate();
  let record = await this.model.findOne(this.getQuery());
  try {
    if (data.status === 'send') await notificationModule.createPermissionAndPush(record);
  } catch (error) {
    console.log('create notification', error);
  }
  done();
});

notificationSchema.pre('save', async function (done) {
  try {
    if (this.status === 'send') await notificationModule.createPermissionAndPush(this);
  } catch (error) {
    console.log('create notification', error);
  }
  done();
});

module.exports = mongoose.model('notification', notificationSchema, 'notification');

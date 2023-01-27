const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({});

module.exports = mongoose.model('setting', settingSchema, 'setting');

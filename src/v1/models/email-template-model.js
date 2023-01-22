const mongoose = require('mongoose');

const templateContent = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'vi',
  },
});

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contents: [templateContent],
  keyword: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'new',
    required: false,
  },
  type: {
    type: Number,
    default: 1,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admin',
    required: true,
  },
});

emailTemplateSchema.index({ keyword: 1, name: 1 }, { unique: true });
emailTemplateSchema.index({ name: 'text' }, { language_override: 'english' });

module.exports = mongoose.model('email_template', emailTemplateSchema, 'email_template');

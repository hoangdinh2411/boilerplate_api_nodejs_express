const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  authorName: {
    type: String,
    required: true,
  },
  metaTitle: {
    type: String,
    required: false,
  },
  metaKeyword: {
    type: String,
    required: false,
  },
  metaDescription: {
    type: String,
    required: false,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog_category',
    required: true,
  },
  status: {
    type: String,
    default: 'draft', // 1 draft, 2 publish, 3 delete
    required: false,
  },
  slug: { type: String, slug: 'title', unique: true },
  language: {
    type: String,
    default: 'vi',
    required: true,
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
  hide: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('blog', blogSchema, 'blog');

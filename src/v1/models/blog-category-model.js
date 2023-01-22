const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const blogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  status: {
    type: Number,
    default: 1,
    required: false,
  },
  slug: { type: String, slug: 'name', unique: true },
  language: {
    type: String,
    default: 'vi',
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

module.exports = mongoose.model('blog_category', blogCategorySchema, 'blog_category');

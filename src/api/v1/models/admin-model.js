const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helperModule = require('@v1/helpers');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    unique: true,
    required: false,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String, // superadmin, admin, support, marketing
    required: false,
  },
  status: {
    type: Number,
    required: false,
  },
});

adminSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, 8);
};

adminSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

adminSchema.methods.passwordEncryption = function (password) {
  return bcrypt.hashSync(password, 8);
};

adminSchema.methods.jsonData = function (member = false) {
  return {
    _id: this._id,
    username: this.username,
    name: this.name,
    token: helperModule.generateToken(
      { id: this._id, username: this.username, role: this.role },
      member,
      'admin',
    ),
    role: this.role,
  };
};

module.exports = mongoose.model('admin', adminSchema, 'admin');

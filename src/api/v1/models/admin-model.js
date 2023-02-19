const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helper = require('@v1/helpers/auth-helper');

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
  this.password = bcrypt.hashSync(password, 10);
};

adminSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

adminSchema.methods.passwordEncryption = function (password) {
  return bcrypt.hashSync(password, 10);
};

adminSchema.methods.jsonData = async function (remember = false) {
  return {
    _id: this._id,
    username: this.username,
    name: this.name,
    token: await helper.generateToken({
      payload: { id: this._id, username: this.username, role: this.role },
      remember,
      type: 'admin',
    }),
    role: this.role,
  };
};

module.exports = mongoose.model('admin', adminSchema, 'admin');

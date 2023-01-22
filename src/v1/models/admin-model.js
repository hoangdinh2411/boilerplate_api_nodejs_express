const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

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
  console.log('🚀 ~ file: admin-model.js:30 ~ password', password);
  this.password = CryptoJS.AES.encrypt(password, process.env.JWT_SECRET_ADMIN).toString();
};

adminSchema.methods.validatePassword = function (password) {
  let passCurr = CryptoJS.AES.decrypt(this.password, process.env.JWT_SECRET_ADMIN).toString(
    CryptoJS.enc.Utf8,
  );
  console.log('🚀 ~ file: admin-model.js:37 ~ passCurr', passCurr);
  return password === passCurr;
};

adminSchema.methods.passwordEncryption = function (password) {
  return CryptoJS.AES.encrypt(password, process.env.JWT_SECRET_ADMIN).toString();
};

adminSchema.methods.generateJWT = function (member = false) {
  let expiresIn = '2d';
  if (member) expiresIn = '30d';
  const payload = {
    username: this.username,
    id: this._id,
    role: this.role,
  };
  const secret = process.env.JWT_SECRET_ADMIN;
  const options = { expiresIn };
  const token = jwt.sign(payload, secret, options);
  return token;
};

adminSchema.methods.jsonData = function (member = false) {
  return {
    _id: this._id,
    username: this.username,
    name: this.name,
    token: this.generateJWT(member),
    role: this.role,
  };
};

module.exports = mongoose.model('admin', adminSchema, 'admin');
